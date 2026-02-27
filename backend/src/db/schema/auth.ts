import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';


export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  pwdHash: text("pwdHash").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export type UsersDB = typeof users.$inferSelect;

// we make a 1 to many map of user to refresh_tokens to allow 
// multi device sessions
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});