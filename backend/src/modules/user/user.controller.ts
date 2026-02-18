import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { ok, created } from '../../common/types/api';
import { userService } from '.';

export const userController = {
  getAllUsers: asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json(ok({ users }));
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    res.json(ok({ user }));
  }),

  createUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    res.status(201).json(created({ user }));
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(ok({ user }));
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  }),
};