import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { validate } from "@/common/utils/zodValidate";
import { requireRole } from "@/common/middleware/rbac";
import { AuthRequest } from "@/common/middleware/auth";
import * as bedService from "./bed.service";

const router = Router();

const createBedDTO = z.object({
  roomId: z.string().uuid(),
  label: z.string().min(1).max(10), // "A", "B", "Top", "Bottom"
});

const updateBedStatusDTO = z.object({
  status: z.enum(["available", "maintenance", "retired"]),
  // "occupied" is intentionally excluded — only allocations can set that
});

// GET /beds/room/:roomId
router.get(
  "/room/:roomId",
  asyncHandler(async (req, res) => {
    res.json({ beds: await bedService.getBedsByRoomId(req.params.roomId) });
  }),
);

// GET /beds/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json({ bed: await bedService.getBedById(req.params.id) });
  }),
);

// POST /beds
router.post(
  "/",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = validate(createBedDTO, req.body);
    res.status(201).json({ bed: await bedService.createBed(data, req.user) });
  }),
);

// PATCH /beds/:id/status
router.patch(
  "/:id/status",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const { status } = validate(updateBedStatusDTO, req.body);
    res.json({ bed: await bedService.updateBedStatus(req.params.id, status, req.user) });
  }),
);

// DELETE /beds/:id
router.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    await bedService.deleteBed(req.params.id, req.user);
    res.json({ message: "Bed deleted" });
  }),
);

export default router;
