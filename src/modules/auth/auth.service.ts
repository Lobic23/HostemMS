import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

import { comparePassword, hashPassword } from "./utils/hashPwd";
import { generateAccessToken, generateRefreshToken } from "./utils/tokens";
import { hashRefreshToken as hashToken } from "./utils/hashToken";
import { JwtPayload } from "@/common/middleware/auth";
import { env } from "@/config/env";
import { tokensExpiryInSex } from "@/config/tokenExpiry";
import { db, refreshTokens } from "db";
import { Role, UserResponse, users, usersSafeSelect } from "db/schema/users";
import { AppError } from "@/common/types/errors";

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) throw AppError.conflict("Email already in use");

  const pwdHash = await hashPassword(password);
  const id = uuidv4();
  const role: Role = "student";

  const [user] = await db.insert(users).values({ id, name, email, pwdHash, role }).returning(usersSafeSelect);

  return user;
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> => {
  const [currUser] = await db.select().from(users).where(eq(users.email, email));

  if (!currUser) throw AppError.unauthorized("Invalid credentials");

  const valid = await comparePassword(password, currUser.pwdHash);
  if (!valid) throw AppError.unauthorized("Invalid credentials");

  const accessToken = generateAccessToken({ id: currUser.id, role: currUser.role });
  const refreshToken = generateRefreshToken({ id: currUser.id, role: currUser.role });

  await db.insert(refreshTokens).values({
    userId: currUser.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + tokensExpiryInSex.REFRESH * 1000),
  });

  const { pwdHash, ...safeUser } = currUser;
  return { user: safeUser, accessToken, refreshToken };
};

export const refreshUserToken = async (refreshToken: string) => {
  let decodedUser: JwtPayload;

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    if (typeof decoded === "string" || !decoded.id || !decoded.role) {
      throw new Error();
    }
    decodedUser = decoded as JwtPayload;
  } catch {
    throw AppError.unauthorized("Invalid refresh token");
  }

  const hashed = hashToken(refreshToken);

  return db.transaction(async (tx) => {
    const [stored] = await tx
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.userId, decodedUser.id), eq(refreshTokens.tokenHash, hashed)));

    if (!stored) {
      // Token not found — possible reuse: revoke all sessions
      await tx.delete(refreshTokens).where(eq(refreshTokens.userId, decodedUser.id));
      throw AppError.unauthorized("Refresh token reuse detected");
    }

    if (stored.expiresAt < new Date()) {
      await tx.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));
      throw AppError.unauthorized("Refresh token expired");
    }

    // Rotate: delete old, insert new
    await tx.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));

    const newAccessToken = generateAccessToken({ id: decodedUser.id, role: decodedUser.role });
    const newRefreshToken = generateRefreshToken({ id: decodedUser.id, role: decodedUser.role });

    await tx.insert(refreshTokens).values({
      userId: decodedUser.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + tokensExpiryInSex.REFRESH * 1000),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  });
};

export const logoutFromCurrentDevice = async (token: string) =>
  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, hashToken(token)));

export const logoutFromAllDevices = async (userId: string) =>
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
