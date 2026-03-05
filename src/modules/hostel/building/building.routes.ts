import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "@/common/utils/asyncHandler";
import { validate } from "@/common/utils/zodValidate";
import { requireRole } from "@/common/middleware/rbac";
import { AuthRequest } from "@/common/middleware/auth";
import * as buildingService from "./building.service";

const createBuildingDTO = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  totalFloors: z.number().int().positive(),
  housingGender: z.enum(["male", "female", "mixed"]),
});

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ buildings: await buildingService.getAllBuildings() });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json({ building: await buildingService.getBuildingById(req.params.id) });
  }),
);

router.post(
  "/",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = validate(createBuildingDTO, req.body);
    res.status(201).json({
      building: await buildingService.createBuilding(data, req.user),
    });
  }),
);

router.patch(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    res.json({
      building: await buildingService.updateBuilding(req.params.id, req.body, req.user),
    });
  }),
);

router.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req: AuthRequest, res) => {
    await buildingService.deleteBuilding(req.params.id, req.user);
    res.json({ message: "Building deleted" });
  }),
);

export default router;
