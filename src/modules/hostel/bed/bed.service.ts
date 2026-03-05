import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { db } from "db";
import { AppError } from "@/common/types/errors";
import { JwtPayload } from "@/common/middleware/auth";
import { beds, rooms } from "db/schema/hostel";

export async function getBedsByRoomId(roomId: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) throw AppError.notFound("Room not found");

  return db.select().from(beds).where(eq(beds.roomId, roomId));
}

export async function getBedById(id: string) {
  const [bed] = await db.select().from(beds).where(eq(beds.id, id));
  if (!bed) throw AppError.notFound("Bed not found");
  return bed;
}

export async function createBed(data: { roomId: string; label: string }, _requester: JwtPayload) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, data.roomId));
  if (!room) throw AppError.notFound("Room not found");
  if (!room.isActive) throw AppError.conflict("Room is not active");

  const [existing] = await db
    .select()
    .from(beds)
    .where(and(eq(beds.roomId, data.roomId), eq(beds.label, data.label)));
  if (existing) throw AppError.conflict("Bed label already exists in this room");

  // Enforce capacity
  const allBeds = await db.select().from(beds).where(eq(beds.roomId, data.roomId));
  const activeBeds = allBeds.filter((b) => b.status !== "retired");
  if (activeBeds.length >= (room.capacity ?? 1)) {
    throw AppError.conflict(`Room is at full capacity (${room.capacity} beds)`);
  }

  const [bed] = await db
    .insert(beds)
    .values({ id: uuidv4(), roomId: data.roomId, label: data.label, status: "available" })
    .returning();
  return bed;
}

export async function updateBedStatus(
  id: string,
  status: "available" | "occupied" | "maintenance" | "retired",
  _requester: JwtPayload,
) {
  const [bed] = await db.select().from(beds).where(eq(beds.id, id));
  if (!bed) throw AppError.notFound("Bed not found");
  if (bed.status === "occupied" && status !== "occupied") {
    throw AppError.conflict("Cannot change status of an occupied bed — vacate the allocation first");
  }

  const [updated] = await db.update(beds).set({ status }).where(eq(beds.id, id)).returning();
  return updated;
}

export async function deleteBed(id: string, _requester: JwtPayload) {
  const [bed] = await db.select().from(beds).where(eq(beds.id, id));
  if (!bed) throw AppError.notFound("Bed not found");
  if (bed.status === "occupied") throw AppError.conflict("Cannot delete an occupied bed");

  await db.delete(beds).where(eq(beds.id, id));
}
