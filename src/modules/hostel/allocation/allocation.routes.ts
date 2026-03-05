import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "@/common/utils/asyncHandler";
import { validate } from "@/common/utils/zodValidate";
import { requireRole } from "@/common/middleware/rbac";
import { AuthRequest } from "@/common/middleware/auth";

import * as allocationService from "./allocation.service";

const router = Router();

const allocateBedDTO = z.object({
  userId: z.uuid(),
  bedId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

router.post(
  "/",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = validate(allocateBedDTO, req.body);
    res.status(201).json({
      allocation: await allocationService.allocateBed(data, req.user),
    });
  }),
);

router.patch(
  "/:id/vacate",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    res.json({
      allocation: await allocationService.vacateBed(req.params.id),
    });
  }),
);

router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    res.json({
      allocation: await allocationService.getActiveAllocation(req.params.userId),
    });
  }),
);

export default router;
