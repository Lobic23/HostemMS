import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Higher index = more permissions
export const ROLES = ["student", "staff", "manager", "admin", "super_admin"] as const;
export const roleEnum = pgEnum("role", ROLES);

export type Role = (typeof ROLES)[number];

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  pwdHash: text("pwdHash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type UsersDB = typeof users.$inferSelect;

export type UserResponse = Omit<UsersDB, "pwdHash">;
export const usersSafeSelect = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
};
