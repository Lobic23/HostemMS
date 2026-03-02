import { eq } from "drizzle-orm";
import { AppError } from "@/common/types/errors";
import { JwtPayload, ROLE_HIERARCHY } from "@/common/middleware/auth";
import { v4 as uuidv4 } from 'uuid';
import { db, users } from "db";
import { hashPassword } from "../auth/utils/hashPwd";

export async function getAllUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);
}

export async function getUserById(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id));

  if (!user) throw AppError.notFound("User not found");
  return user;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const existing = await db.select().from(users).where(eq(users.email, data.email));
  if (existing.length > 0) throw AppError.conflict("Email already in use");

  const pwdHash = await hashPassword(data.password);
  const id = uuidv4();

  const [user] = await db
    .insert(users)
    .values({ id, name: data.name, email: data.email, pwdHash, role: data.role })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  return user;
}

export async function updateUser(
  targetId: string,
  data: { name?: string; email?: string; password?: string; role?: string },
  requester: JwtPayload,
) {
  const [target] = await db.select().from(users).where(eq(users.id, targetId));
  if (!target) throw AppError.notFound("User not found");

  // Admins cannot edit other admins or super_admins
  const requesterLevel = ROLE_HIERARCHY[requester.role] ?? -1;
  const targetLevel = ROLE_HIERARCHY[target.role] ?? -1;
  if (requesterLevel <= targetLevel && requester.id !== targetId) {
    throw AppError.forbidden("Cannot edit a user with equal or higher role");
  }

  const updates: Partial<typeof users.$inferInsert> = {};
  if (data.name) updates.name = data.name;
  if (data.email) updates.email = data.email;
  if (data.role) updates.role = data.role;
  if (data.password) updates.pwdHash = await hashPassword(data.password);

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, targetId))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  return updated;
}

export async function deleteUser(id: string) {
  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
  if (!deleted) throw AppError.notFound("User not found");
  return deleted;
}
