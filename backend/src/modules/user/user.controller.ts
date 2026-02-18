import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { ok, created } from "../../common/types/api";
import { NotFoundError, ValidationError } from "../../common/types/errors";
import { db, users } from "../../db";
import type { CreateUserDto, UpdateUserDto, UserResponse } from "./user.types";

const safeUserSelect = {
  id: users.id,
  name: users.name,
  email: users.email,
  createdAt: users.createdAt,
};

export const userController = {
  getAllUsers: asyncHandler(async (_req: Request, res: Response) => {
    const allUsers: UserResponse[] = await db
      .select(safeUserSelect)
      .from(users);

    res.json(ok<{ users: UserResponse[] }>({ users: allUsers }));
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const rows: UserResponse[] = await db
      .select(safeUserSelect)
      .from(users)
      .where(eq(users.id, req.params.id))
      .limit(1);

    if (!rows[0])
      throw new NotFoundError(`User with id ${req.params.id} not found`);

    res.json(ok<{ user: UserResponse }>({ user: rows[0] }));
  }),

  createUser: asyncHandler(async (req: Request, res: Response) => {
    const data: CreateUserDto = req.body;

    if (!data.email || !data.name || !data.password)
      throw new ValidationError("Name, email and password are required");

    const rows: UserResponse[] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        ...data,
      })
      .returning(safeUserSelect);

    res.status(201).json(created<{ user: UserResponse }>({ user: rows[0] }));
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const data: UpdateUserDto = req.body;

    const rows: UserResponse[] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, req.params.id))
      .returning(safeUserSelect);

    if (!rows[0])
      throw new NotFoundError(`User with id ${req.params.id} not found`);

    res.json(ok<{ user: UserResponse }>({ user: rows[0] }));
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const rows = await db
      .delete(users)
      .where(eq(users.id, req.params.id))
      .returning({ id: users.id });

    if (!rows.length)
      throw new NotFoundError(`User with id ${req.params.id} not found`);

    res.status(204).send();
  }),
};
