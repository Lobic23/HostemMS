import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  const method = req.method;
  const url = req.originalUrl;
  const params = req.params ? { ...req.params } : {};
  const query = req.query ? { ...req.query } : {};
  const body = req.body ? { ...req.body } : {};

  const originalJson = res.json.bind(res);
  let responseBody: unknown;
  res.json = (b) => {
    responseBody = b;
    return originalJson(b);
  };

  res.on("finish", () => {
    try {
      const ms = Date.now() - start;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

      logger[level]({
        type: "http",
        method,
        url,
        status: res.statusCode,
        ms,
        ip: req.ip,
        userId: (req as any).user?.id,
        ...(Object.keys(params).length && { params }),
        ...(Object.keys(query).length && { query }),
        ...(Object.keys(body).length && { body }),
        ...(responseBody !== undefined && { response: responseBody }),
      });
    } catch {}
  });

  next();
}
