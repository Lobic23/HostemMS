import { v4 as uuidv4 } from "uuid";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "db";
import { AppError } from "@/common/types/errors";
import { JwtPayload } from "@/common/middleware/auth";
import { rooms, beds, buildings } from "db/schema/hostel";

export async function getRoomsByBuildingId(buildingId: string) {
  const [building] = await db.select().from(buildings).where(eq(buildings.id, buildingId));
  if (!building) throw AppError.notFound("Building not found");

  return db
    .select()
    .from(rooms)
    .where(and(eq(rooms.buildingId, buildingId), eq(rooms.isActive, true)));
}

export async function getRoomById(id: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
  if (!room) throw AppError.notFound("Room not found");
  return room;
}

export async function getRoomAvailability(roomId: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) throw AppError.notFound("Room not found");

  const allBeds = await db.select().from(beds).where(eq(beds.roomId, roomId));

  return {
    room,
    totalBeds: allBeds.length,
    availableBeds: allBeds.filter((b) => b.status === "available").length,
    occupiedBeds: allBeds.filter((b) => b.status === "occupied").length,
    maintenanceBeds: allBeds.filter((b) => b.status === "maintenance").length,
    retiredBeds: allBeds.filter((b) => b.status === "retired").length,
    beds: allBeds,
  };
}

export async function getAvailableRooms(buildingId?: string) {
  // Find all room IDs that have at least one available bed
  const availableBeds = await db.select({ roomId: beds.roomId }).from(beds).where(eq(beds.status, "available"));

  const roomIds = [...new Set(availableBeds.map((b) => b.roomId))];
  if (roomIds.length === 0) return [];

  return db
    .select()
    .from(rooms)
    .where(
      and(
        inArray(rooms.id, roomIds),
        eq(rooms.isActive, true),
        ...(buildingId ? [eq(rooms.buildingId, buildingId)] : []),
      ),
    );
}

export async function createRoom(
  data: { buildingId: string; roomNumber: string; floor: number; capacity: number },
  _requester: JwtPayload,
) {
  const [building] = await db.select().from(buildings).where(eq(buildings.id, data.buildingId));
  if (!building) throw AppError.notFound("Building not found");
  if (!building.isOperating) throw AppError.conflict("Building is not operating");

  // Uniqueness is enforced by DB index, but give a nicer error
  const [existing] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.buildingId, data.buildingId), eq(rooms.roomNumber, data.roomNumber)));
  if (existing) throw AppError.conflict("Room number already exists in this building");

  const [room] = await db
    .insert(rooms)
    .values({ id: uuidv4(), ...data })
    .returning();
  return room;
}

export async function updateRoom(
  id: string,
  data: Partial<{ roomNumber: string; floor: number; capacity: number; isActive: boolean }>,
  _requester: JwtPayload,
) {
  const [existing] = await db.select().from(rooms).where(eq(rooms.id, id));
  if (!existing) throw AppError.notFound("Room not found");

  const [updated] = await db.update(rooms).set(data).where(eq(rooms.id, id)).returning();
  return updated;
}
