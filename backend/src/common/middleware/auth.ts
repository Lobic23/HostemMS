import { env } from "@/config/env";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../types/errors";

export const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  admin: 1,
  super_admin: 2,
}

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
  } catch (err){
    // console.log("JWT Error:", err)
    next(AppError.unauthorized("Invalid or expired token"));
  }
};



export const authorize = (...roles: string[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role

    if (!userRole || !roles.includes(userRole)) {
      next(AppError.forbidden())
      return
    }

    next()
  }

// use this if you want "at least this level" checks
export const authorizeMin = (minRole: string) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role
    const userLevel = ROLE_HIERARCHY[userRole ?? ''] ?? -1
    const minLevel = ROLE_HIERARCHY[minRole] ?? 0

    if (userLevel < minLevel) {
      next(AppError.forbidden())
      return
    }

    next()
  }

