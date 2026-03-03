import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "@/common/utils/asyncHandler";
import { validate } from "@/common/utils/zodValidate";
import { authenticate, AuthRequest } from "@/common/middleware/auth";
import { getAllUsers, getUserById, createAccount, updateUser, deleteUser } from "./user.service";
import { requireRole, requireOwnerOrRole } from "@/common/middleware/rbac";
import { ROLES } from "db/schema/users"; 

const createUserDTO = z.object({
  name: z.string().min(1).max(100),
  email: z.email("Invalid email address"),
  password: z.string().min(8).max(128),
  role: z.enum(ROLES).default("student"),
});

const updateUserDTO = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email("Invalid email address").optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(ROLES).optional(),
});

const router = Router();
router.use(authenticate); // all routes require auth

router.get(
  "/",
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const users = await getAllUsers();
    res.status(200).json({ users });
  }),
);

router.get(
  "/:id",
  requireOwnerOrRole("admin"),
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    res.status(200).json({ user });
  }),
);

router.post(
  "/",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, email, password, role } = validate(createUserDTO, req.body);
    const user = await createAccount(name, email, password, role, req.user);
    res.status(201).json({ user });
  }),
);

router.patch(
  "/:id",
  requireOwnerOrRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const body = validate(updateUserDTO, req.body);
    const user = await updateUser(req.params.id, body, req.user);
    res.status(200).json({ user });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    await deleteUser(req.params.id, req.user);
    res.status(200).json({ message: "User deleted" });
  }),
);

export default router;