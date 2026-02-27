import { Router } from "express";

import { asyncHandler } from "@/common/utils/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res ) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  }),
);

export default router;
