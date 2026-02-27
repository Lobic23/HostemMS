import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/errors";
import { env } from "@/config/env";


export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      // ...(env.isDevelopment && { stack: err.stack }),
    });
    return;
  }

  console.error("[Unhandled Error]:", err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
    ...(env.isDevelopment && {
      stack: err instanceof Error ? err.stack : undefined,
    }),
  });
};