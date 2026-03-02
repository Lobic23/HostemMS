import { Router } from "express";
import { z } from "zod";

import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutFromCurrentDevice,
  logoutFromAllDevices,
} from "./auth.service";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { AppError } from "@/common/types/errors";
import { validate } from "@/common/utils/zodValidate";
import { authenticate, AuthRequest } from "@/common/middleware/auth";

const registerDTO = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Invalid email address"),
  // password: z.string().min(1, "Password must be at least 8 characters").max(128),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginDTO = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const router = Router();
{
  router.post(
    // requires no tokens
    "/register",
    asyncHandler(async (req, res) => {
      const { name, email, password } = validate(registerDTO, req.body);

      await registerUser(name, email, password);

      res.status(201).json({ message: "Registered" });
    }),
  );

  router.post(
    // requires no tokens
    "/login",
    asyncHandler(async (req, res) => {
      const { email, password } = validate(loginDTO, req.body);

      const result = await loginUser(email, password);

      res.status(200).json({ accessToken: result.accessToken, refreshToken: result.refreshToken , user: result.user});
      //  cookie should have been enough but as we want a flutter app
      //  we also need to pass the refreshToken throught the respose
    }),
  );

  router.post(
    // requires refresh token
    "/refresh",
    asyncHandler(async (req, res) => {
      const { refreshToken } = req.body;
      if (!refreshToken) throw AppError.unauthorized("No refresh token");

      const tokens = await refreshUserToken(refreshToken);

      res.status(200).json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    }),
  );

  router.post(
    "/logout",
    asyncHandler(async (req, res) => {
      const { refreshToken } = req.body;
      if (!refreshToken) throw AppError.unauthorized("No refresh token");
      await logoutFromCurrentDevice(refreshToken);
      res.status(200).json({ message: "Logged out" });
    }),
  );

  router.post(
    // requires acess token
    "/logout-all",
    authenticate, // this dependeny also populates the user.id
    asyncHandler(async (req, res) => {
      await logoutFromAllDevices((req as AuthRequest).user.id);

      res.status(200).json({ message: "Logged out from all devices" });
    }),
  );
}
export default router;
