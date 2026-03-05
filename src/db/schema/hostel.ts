import { pgTable, pgEnum, text, integer, boolean, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const housingGenderEnum = pgEnum("housing_gender", ["male", "female", "mixed"]);
export const bedStatusEnum = pgEnum("bed_status", ["available", "occupied", "maintenance", "retired"]);
export const allocationStatusEnum = pgEnum("allocation_status", ["active", "vacated", "cancelled"]);

export const buildings = pgTable("buildings", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g. "BLK-A"
  totalFloors: integer("total_floors").notNull(),
  gender: housingGenderEnum("gender").notNull(),
  isOperating: boolean("is_operating").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rooms = pgTable(
  "rooms",
  {
    id: text("id").primaryKey(),
    buildingId: text("building_id")
      .notNull()
      .references(() => buildings.id),
    roomNumber: text("room_number").notNull(), // e.g. "101"
    floor: integer("floor").notNull(),
    capacity: integer("capacity").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_room_per_building").on(t.buildingId, t.roomNumber)],
);

export const beds = pgTable(
  "beds",
  {
    id: text("id").primaryKey(),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id),
    label: text("label").notNull(), // e.g. "A", "Top"
    status: bedStatusEnum("status").notNull().default("available"),
  },
  (t) => [uniqueIndex("uq_label_per_room").on(t.roomId, t.label)],
);

export const allocations = pgTable(
  "allocations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    bedId: text("bed_id")
      .notNull()
      .references(() => beds.id),
    status: allocationStatusEnum("status").notNull().default("active"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"), // planned end
    vacatedAt: timestamp("vacated_at"), // actual departure
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    // Prevents double-booking at the DB level
    uniqueIndex("uq_active_allocation_per_bed")
      .on(t.bedId)
      .where(sql`status = 'active'`),
    index("idx_allocations_user").on(t.userId),
  ],
);

export type BedStatus = (typeof bedStatusEnum.enumValues)[number];
export type AllocationStatus = (typeof allocationStatusEnum.enumValues)[number];
