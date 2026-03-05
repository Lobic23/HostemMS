import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { db } from "db";
import { AppError } from "@/common/types/errors";
import { type JwtPayload } from "@/common/middleware/auth";
import { users } from "db/schema/users";
import { beds, allocations } from "db/schema/hostel";

export async function allocateBed(
  data: { userId: string; bedId: string; startDate: Date; endDate?: Date; notes?: string },
  _requester: JwtPayload,
) {
  return db.transaction(async (tx) => {
    //  Verify user exists
    const [user] = await tx.select().from(users).where(eq(users.id, data.userId));
    if (!user) throw AppError.notFound("User not found");

    //  Check bed is available
    const [bed] = await tx.select().from(beds).where(eq(beds.id, data.bedId));
    if (!bed) throw AppError.notFound("Bed not found");
    if (bed.status !== "available") {
      throw AppError.conflict(`Bed is not available (current status: ${bed.status})`);
    }

    // Check user doesn't already have an active allocation
    const [existingAllocation] = await tx
      .select()
      .from(allocations)
      .where(and(eq(allocations.userId, data.userId), eq(allocations.status, "active")));
    if (existingAllocation) throw AppError.conflict("User already has an active bed allocation");

    // Create allocation
    const [allocation] = await tx
      .insert(allocations)
      .values({
        id: uuidv4(),
        userId: data.userId,
        bedId: data.bedId,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        notes: data.notes ?? null,
        status: "active",
      })
      .returning();

    //  Mark bed as occupied
    await tx.update(beds).set({ status: "occupied" }).where(eq(beds.id, data.bedId));

    return allocation;
  });
}

export async function vacateBed(allocationId: string) {
  return db.transaction(async (tx) => {
    const [allocation] = await tx.select().from(allocations).where(eq(allocations.id, allocationId));
    if (!allocation) throw AppError.notFound("Allocation not found");
    if (allocation.status !== "active") throw AppError.conflict("Allocation is not active");

    const [updated] = await tx
      .update(allocations)
      .set({ status: "vacated", vacatedAt: new Date() })
      .where(eq(allocations.id, allocationId))
      .returning();

    await tx.update(beds).set({ status: "available" }).where(eq(beds.id, allocation.bedId));

    return updated;
  });
}

export async function getAllocationsByUser(userId: string) {
  return db.select().from(allocations).where(eq(allocations.userId, userId));
}

export async function getActiveAllocation(userId: string) {
  const [allocation] = await db
    .select()
    .from(allocations)
    .where(and(eq(allocations.userId, userId), eq(allocations.status, "active")));
  return allocation ?? null;
}
