import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/errors";
import { env } from "@/config/env";
import logger from "../logger";

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    const level = err.statusCode >= 500 ? "error" : "warn";

    logger[level]({
      type: "app_error",
      status: err.statusCode,
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      userId: (req as any).user?.id,
      ...(Object.keys(req.params).length && { params: req.params }),
      ...(Object.keys(req.query).length && { query: req.query }),
      ...(req.body && Object.keys(req.body).length && { body: req.body }),
      ...(env.isDevelopment && { stack: err.stack }),
    });

    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  logger.error(
    {
      type: "unhandled_error",
      err,
      url: req.originalUrl,
      method: req.method,
      userId: (req as any).user?.id,
      ...(Object.keys(req.params).length && { params: req.params }),
      ...(Object.keys(req.query).length && { query: req.query }),
      ...(req.body && Object.keys(req.body).length && { body: req.body }),
    },
    "Unhandled error",
  );

  res.status(500).json({
    status: "error",
    message: "Internal server error",
    ...(env.isDevelopment && {
      stack: err instanceof Error ? err.stack : undefined,
    }),
  });
};
