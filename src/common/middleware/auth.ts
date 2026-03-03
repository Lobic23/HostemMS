import { env } from "@/config/env";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../types/errors";

export interface AuthRequest extends Request {
  user?: any;
}

export interface JwtPayload {
  id: string;
  role: string;
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  // console.log("RAW HEADER:", req.headers.authorization)
  // console.log("TOKEN:", req.headers.authorization?.split(" ")[1])
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(AppError.unauthorized());
    return;
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    // console.log("JWT Error:", err)
    next(AppError.unauthorized("Invalid or expired token"));
  }
};


