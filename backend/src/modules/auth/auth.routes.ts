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
import { tokensExpiryInSex } from "@/config/tokenExpiry";
import { env } from "@/config/env";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true, // bijan dont hack me
  secure: env.isProduction, // enforce https in prod
  sameSite: "none" as const, // can alow route
  maxAge: tokensExpiryInSex.REFRESH * 1000,
};

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

router.post(  // requires no tokens
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = validate(registerDTO, req.body);

    await registerUser(name, email, password);

    res.status(201).json({ message: "Registered" });
  }),
);

router.post( // requires no tokens
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = validate(loginDTO, req.body);

    const tokens = await loginUser(email, password);

    res
      .cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS)
      .status(200)
      .json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    //  cookie should have been enough but as we want a flutter app
    //  we also need to pass the refreshToken throught the respose
  }),
);

router.post(  // requires refresh token
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw AppError.unauthorized("No refresh token");
    }

    const tokens = await refreshUserToken(token);

    res
      .cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS)
      .status(200)
      .json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

  }),
);

router.post(  // requires refresh token
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw AppError.unauthorized("No refresh token");
    }

    await logoutFromCurrentDevice(token);

    res.clearCookie("refreshToken", COOKIE_OPTIONS).status(200).json({ message: "Logged out" });
  }),
);

router.post(  // requires acess token
  "/logout-all",
  authenticate, // this dependeny also populates the user.id
  asyncHandler(async (req, res) => {
    await logoutFromAllDevices((req as AuthRequest).user.id);

    res
      .clearCookie("refreshToken", COOKIE_OPTIONS)
      .status(200)
      .json({ message: "Logged out from all devices" });
  }),
);

export default router;
