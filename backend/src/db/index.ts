import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from '../config';
import * as schema from './schema';
import postgres from 'postgres';

const client = postgres(config.db.url);
export const db = drizzle(client, { schema });

export * from './schema';


// use bun db:generate to generate the migration sql from the schema
// use bun db:migrate to push the migrations to database (NEON)
// use bun db:studio to open a web view of the db tables