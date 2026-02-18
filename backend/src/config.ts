// all the system config go here
// i highly recomend creating using the config and doing config.flag
// instead of process.env.FLAG for type safetly and 'single source of truth'

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  db: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/mydb',
  },
} as const;