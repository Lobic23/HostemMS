import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "db";
import { AppError } from "@/common/types/errors";
import { JwtPayload } from "@/common/middleware/auth";
import { buildings } from "db/schema/hostel";

export async function getAllBuildings() {
  return db.select().from(buildings);
}

export async function getBuildingById(id: string) {
  const [building] = await db.select().from(buildings).where(eq(buildings.id, id));
  if (!building) throw AppError.notFound("Building not found");
  return building;
}

export async function createBuilding(
  data: { name: string; code: string; totalFloors: number; housingGender: "male" | "female" | "mixed" },
  _requester: JwtPayload,
) {
  const [existing] = await db.select().from(buildings).where(eq(buildings.code, data.code));
  if (existing) throw AppError.conflict("Building code already in use");

  const [building] = await db
    .insert(buildings)
    .values({ id: uuidv4(), gender: data.housingGender, ...data })
    .returning();
  return building;
}

export async function updateBuilding(
  id: string,
  data: Partial<{ name: string; totalFloors: number; isActive: boolean }>,
  _requester: JwtPayload,
) {
  const [existing] = await db.select().from(buildings).where(eq(buildings.id, id));
  if (!existing) throw AppError.notFound("Building not found");

  const [updated] = await db
    .update(buildings)
    .set({ ...data })
    .where(eq(buildings.id, id))
    .returning();
  return updated;
}

export async function deleteBuilding(id: string, _requester: JwtPayload) {
  const [existing] = await db.select().from(buildings).where(eq(buildings.id, id));
  if (!existing) throw AppError.notFound("Building not found");
  await db.delete(buildings).where(eq(buildings.id, id));
}
