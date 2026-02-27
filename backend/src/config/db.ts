import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  url: process.env.DATABASE_URL || "postgres://localhost:5432/mydb",
} as const;