import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Capture response body
  const originalJson = res.json.bind(res);
  let responseBody: unknown;
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level]({
      type: "http",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms,
      ip: req.ip,
      userId: (req as any).user?.id,
      ...(Object.keys(req.params).length && { params: req.params }),
      ...(Object.keys(req.query).length && { query: req.query }),
      ...(req.body && Object.keys(req.body).length && { body: req.body }),
      ...(responseBody !== undefined && { response: responseBody }),
    });
  });

  next();
}
