import { eq } from 'drizzle-orm';
import { db, type UserDB, users } from '../../db';
import { NotFoundError, ValidationError } from '../../common/types/errors';
import type { CreateUserDto, UpdateUserDto} from './user.types';

export const userService = {
  async getAllUsers(): Promise<UserDB[]> {
    return db.select().from(users);
  },

  async getUserById(id: string): Promise<UserDB> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!rows[0]) throw new NotFoundError(`User with id ${id} not found`);
    return rows[0];
  },

  async createUser(data: CreateUserDto): Promise<UserDB> {
    if (!data.email || !data.name) throw new ValidationError('Name and email are required');
    const rows = await db
      .insert(users)
      .values({ id: Math.random().toString(36).substring(7), ...data })
      .returning();
    return rows[0];
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<UserDB> {
    const rows = await db.update(users).set(data).where(eq(users.id, id)).returning();
    if (!rows[0]) throw new NotFoundError(`User with id ${id} not found`);
    return rows[0];
  },

  async deleteUser(id: string): Promise<void> {
    const rows = await db.delete(users).where(eq(users.id, id)).returning();
    if (!rows.length) throw new NotFoundError(`User with id ${id} not found`);
  }
}

