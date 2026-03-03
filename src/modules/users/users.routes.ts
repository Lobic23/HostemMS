import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { validate } from "@/common/utils/zodValidate";
import { authenticate, authorizeRoles, AuthRequest } from "@/common/middleware/auth";
import { getAllUsers, getUserById, createAccount, updateUser, deleteUser } from "./user.service";

const router = Router();

const createUserDTO = z.object({
  name: z.string().min(1).max(100),
  email: z.email("Invalid email address"),
  password: z.string().min(8).max(128),
  role: z.enum(["user", "admin", "super_admin"]).default("user"),
});

const updateUserDTO = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email("Invalid email address").optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

// All routes require authentication
router.use(authenticate);

router.get(
  "/",
  authorizeRoles("admin", "super_admin"),
  asyncHandler(async (_req, res) => {
    const users = await getAllUsers();
    res.status(200).json({ users });
  }),
);

router.get(
  "/:id",
  authorizeRoles("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    res.status(200).json({ user });
  }),
);

router.post(
  "/",
  authorizeRoles("admin", "super_admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const body = validate(createUserDTO, req.body);

    if (["admin", "super_admin"].includes(body.role) && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only super admins can create admin or super admin users" });
    }

    const user = await createAccount(body);
    res.status(201).json({ user });
    return;
  }),
);

router.patch(
  "/:id",
  authorizeRoles("admin", "super_admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const body = validate(updateUserDTO, req.body);

    // Only super_admin can promote to admin
    if (body.role === "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Only super admins can assign admin role" });
    }

    const user = await updateUser(req.params.id, body, req.user);
    res.status(200).json({ user });
    return;
  }),
);

router.delete(
  "/:id",
  authorizeRoles("super_admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    // Prevent self-deletion
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await deleteUser(req.params.id);
    res.status(200).json({ message: "User deleted" });
    return;
  }),
);

export default router;
