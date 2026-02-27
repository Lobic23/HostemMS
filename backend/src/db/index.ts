import { drizzle } from 'drizzle-orm/postgres-js';
import { dbConfig } from '@/config/db';
import * as schema from './schema/auth';
import postgres from 'postgres';

const client = postgres(dbConfig.url);
export const db = drizzle(client, { schema });

export * from './schema/auth';


// use bun db:generate to generate the migration sql from the schema
// use bun db:migrate to push the migrations to database (NEON)