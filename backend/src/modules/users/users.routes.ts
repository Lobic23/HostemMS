import { Router } from "express";
import { authenticate, authorize, AuthRequest } from "@/common/middleware/auth";

const router = Router();

// Public route — no middleware, anyone can access
router.get("/public", (_req, res) => {
  res.json({ message: "Anyone can see this" });
});

// Authenticated route — any logged in user
router.get("/me", authenticate, (req, res) => {
  const user = (req as AuthRequest).user;
  res.json({ message: "Your profile", user });
});

// Authorized route — only admins
router.get("/admin/dashboard", authenticate, authorize("admin"), (_req, res) => {
  res.json({ message: "Welcome admin" });
});

// Authorized route — only users
router.get("/user/dashboard", authenticate, authorize("user"), (_req, res) => {
  res.json({ message: "Welcome user" });
});


export default router;