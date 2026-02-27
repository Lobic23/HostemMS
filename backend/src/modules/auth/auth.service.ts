import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { hashPassword, comparePassword } from "./utils/hashPwd";
import { generateAccessToken, generateRefreshToken } from "./utils/tokens";
import jwt from "jsonwebtoken";
import { hashRefreshToken as hashToken } from "./utils/hashToken";
import { JwtPayload } from "@/common/middleware/auth";
import { db, users, type UsersDB, refreshTokens } from "db";
import { env } from "@/config/env";
import { tokensExpiryInSex } from "@/config/tokenExpiry";

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length) throw new Error("User already exists");

  const hashed = await hashPassword(password);
  const id: string = uuidv4();

  await db.insert(users).values({ id, name, email, pwdHash: hashed });
};

export const loginUser = async (email: string, password: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));

  if (!user.length) throw new Error("Invalid credentials");

  const currUser: UsersDB = user[0];

  const valid = await comparePassword(password, currUser.pwdHash);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken({
    id: currUser.id,
    role: currUser.role,
  });

  const refreshToken = generateRefreshToken({
    id: currUser.id,
    role: currUser.role,
  });

  await db.insert(refreshTokens).values({
    userId: currUser.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + tokensExpiryInSex.REFRESH * 1000),
  });

  return { accessToken, refreshToken };
};

export const refreshUserToken = async (refreshToken: string) => {
  let decodedUser: JwtPayload;

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    if (typeof decoded === "string" || !decoded.id || !decoded.role) {
      throw new Error("Invalid refresh token");
    }

    decodedUser = decoded as JwtPayload;
  } catch {
    throw new Error("Invalid refresh token");
  }

  const hashed = hashToken(refreshToken);

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await db.transaction(
    async (tx) => {
      const stored = await tx
        .select()
        .from(refreshTokens)
        .where(and(eq(refreshTokens.userId, decodedUser.id), eq(refreshTokens.tokenHash, hashed)));

      // Token not found — possible reuse: revoke all sessions for this user
      if (!stored.length) {
        await tx.delete(refreshTokens).where(eq(refreshTokens.userId, decodedUser.id));

        throw new Error("Refresh token reuse detected");
      }

      // Check DB-level expiry (belt-and-suspenders alongside JWT expiry)
      if (stored[0].expiresAt < new Date()) {
        await tx.delete(refreshTokens).where(eq(refreshTokens.id, stored[0].id));

        throw new Error("Refresh token expired");
      }


      // Rotate: delete old token
      await tx.delete(refreshTokens).where(eq(refreshTokens.id, stored[0].id));

      const newAccessToken = generateAccessToken({
        id: decodedUser.id,
        role: decodedUser.role,
      });

      const newRefreshToken = generateRefreshToken({
        id: decodedUser.id,
        role: decodedUser.role,
      });

      // Insert new token

      await db.insert(refreshTokens).values({
        userId: decodedUser.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + tokensExpiryInSex.REFRESH * 1000),
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    },
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutFromCurrentDevice = async (token: string) => {
  const hashed = hashToken(token);

  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, hashed));
};

export const logoutFromAllDevices = async (userId: string) => {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
};
