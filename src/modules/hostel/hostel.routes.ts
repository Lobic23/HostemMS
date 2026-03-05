import { Router } from "express";
import { authenticate } from "@/common/middleware/auth";

import buildingRoutes from "./building/building.routes";
import roomRoutes from "./room/room.routes";
import allocationRoutes from "./allocation/allocation.routes";
import bedRouter from "./bed/bed.routes";

const router = Router();

router.use(authenticate);

router.use("/buildings", buildingRoutes);
router.use("/rooms", roomRoutes);
router.use("/allocations", allocationRoutes);
router.use("/beds", bedRouter);

export default router;
