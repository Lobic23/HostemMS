import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

// we make a 1 to many map of user to refresh_tokens to allow
// multi device sessions
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
