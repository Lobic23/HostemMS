import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

import { AppError } from "@/common/types/errors";
import { JwtPayload } from "@/common/middleware/auth";
import { db } from "db";
import { hashPassword } from "../auth/utils/hashPwd";
import { Role, usersSafeSelect, users } from "db/schema/users";
import { getRoleLevel } from "@/common/middleware/rbac";

export async function getAllUsers() {
  return db.select(usersSafeSelect).from(users);
}

export async function getUserById(id: string) {
  const [user] = await db.select(usersSafeSelect).from(users).where(eq(users.id, id));
  if (!user) throw AppError.notFound("User not found");
  return user;
}

export async function createAccount(
  name: string,
  email: string,
  password: string,
  role: Role = "student",
  requester: JwtPayload,
) {
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) throw AppError.conflict("Email already in use");

  // Can't create a user with role >= your own
  if (getRoleLevel(role) >= getRoleLevel(requester.role as Role)) {
    throw AppError.forbidden("Cannot create a user with equal or higher role than your own");
  }

  const pwdHash = await hashPassword(password);
  const id = uuidv4();

  const [user] = await db.insert(users).values({ id, name, email, pwdHash, role }).returning(usersSafeSelect);

  return user;
}

export async function updateUser(
  targetId: string,
  data: { name?: string; email?: string; password?: string; role?: Role },
  requester: JwtPayload,
) {
  const [target] = await db.select().from(users).where(eq(users.id, targetId));
  if (!target) throw AppError.notFound("User not found");

  const requesterLevel = getRoleLevel(requester.role as Role);
  const targetLevel = getRoleLevel(target.role);
  const isSelf = requester.id === targetId;

  // Can't touch users at same level or above (unless editing yourself)
  if (!isSelf && requesterLevel <= targetLevel) {
    throw AppError.forbidden("Cannot edit a user with equal or higher role");
  }

  // Can't assign a role equal to or above your own
  if (data.role !== undefined) {
    const newRoleLevel = getRoleLevel(data.role);
    if (newRoleLevel >= requesterLevel) {
      throw AppError.forbidden("Cannot assign a role equal to or above your own");
    }

    // Can't demote yourself
    if (isSelf) {
      throw AppError.forbidden("Cannot change your own role");
    }
  }

  const updates: Partial<typeof users.$inferInsert> = {};
  if (data.name) updates.name = data.name;
  if (data.email) updates.email = data.email;
  if (data.role) updates.role = data.role;
  if (data.password) updates.pwdHash = await hashPassword(data.password);

  const [updated] = await db.update(users).set(updates).where(eq(users.id, targetId)).returning(usersSafeSelect);

  return updated;
}

export async function deleteUser(targetId: string, requester: JwtPayload) {
  // Self-deletion blocked in service, not router
  if (requester.id === targetId) {
    throw AppError.forbidden("Cannot delete your own account");
  }

  const [target] = await db.select().from(users).where(eq(users.id, targetId));
  if (!target) throw AppError.notFound("User not found");

  // Any role strictly above the target can delete
  if (getRoleLevel(requester.role as Role) <= getRoleLevel(target.role)) {
    throw AppError.forbidden("Cannot delete a user with equal or higher role");
  }

  const [deleted] = await db.delete(users).where(eq(users.id, targetId)).returning({ id: users.id });

  return deleted;
}
