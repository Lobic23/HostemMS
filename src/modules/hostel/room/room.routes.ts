import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { validate } from "@/common/utils/zodValidate";
import { requireRole } from "@/common/middleware/rbac";
import { AuthRequest } from "@/common/middleware/auth";
import * as roomService from "./room.service";

const router = Router();

const createRoomDTO = z.object({
  buildingId: z.string().uuid(),
  roomNumber: z.string().min(1).max(20),
  floor: z.number().int().min(0),
  capacity: z.number().int().positive().max(20),
});

const updateRoomDTO = z.object({
  roomNumber: z.string().min(1).max(20).optional(),
  floor: z.number().int().min(0).optional(),
  capacity: z.number().int().positive().max(20).optional(),
  isActive: z.boolean().optional(),
});

router.get(
  "/building/:buildingId",
  asyncHandler(async (req, res) => {
    res.json({ rooms: await roomService.getRoomsByBuildingId(req.params.buildingId) });
  }),
);

router.get(
  "/available",
  asyncHandler(async (req, res) => {
    const buildingId = req.query.buildingId as string | undefined;
    res.json({ rooms: await roomService.getAvailableRooms(buildingId) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json({ room: await roomService.getRoomById(req.params.id) });
  }),
);

router.get(
  "/:id/availability",
  asyncHandler(async (req, res) => {
    res.json(await roomService.getRoomAvailability(req.params.id));
  }),
);

router.post(
  "/",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = validate(createRoomDTO, req.body);
    res.status(201).json({ room: await roomService.createRoom(data, req.user) });
  }),
);

router.patch(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = validate(updateRoomDTO, req.body);
    res.json({ room: await roomService.updateRoom(req.params.id, data, req.user) });
  }),
);

export default router;
