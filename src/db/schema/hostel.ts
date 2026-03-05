import { pgTable, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const ROOM_TYPES = ["single", "double", "triple", "quad"] as const;
export const BED_STATUSES = ["available", "occupied", "maintenance"] as const;
export const ALLOCATION_STATUSES = ["active", "vacated", "cancelled"] as const;
export const COMPLAINT_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export const COMPLAINT_CATEGORIES = ["maintenance", "cleanliness", "noise", "security", "other"] as const;

export const roomTypeEnum = pgEnum("room_type", ROOM_TYPES);
export const bedStatusEnum = pgEnum("bed_status", BED_STATUSES);
export const allocationStatusEnum = pgEnum("allocation_status", ALLOCATION_STATUSES);
export const complaintStatusEnum = pgEnum("complaint_status", COMPLAINT_STATUSES);
export const complaintCategoryEnum = pgEnum("complaint_category", COMPLAINT_CATEGORIES);

export const buildings = pgTable("buildings", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g. "BLK-A"
  totalFloors: integer("total_floors").notNull(),
  housingGender: text("housingGender", { enum: ["male", "female", "mixed"] }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  buildingId: text("building_id")
    .notNull()
    .references(() => buildings.id),
  number: text("number").notNull(), // e.g. "101"
  floor: integer("floor").notNull(),
  // TODO : maybe we need room capacity and room resident count instead of type
  type: roomTypeEnum("type").notNull(),
  capacity: integer("capacity").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const beds = pgTable("beds", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id),
  label: text("label").notNull(), // e.g. "A", "B", "Top", "Bottom"
  status: bedStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hostel-specific student profile (separate from auth users table)
export const studentProfiles = pgTable("student_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  studentNumber: text("student_number").notNull().unique(),
  phone: text("phone"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const allocations = pgTable("allocations", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => studentProfiles.id),
  bedId: text("bed_id")
    .notNull()
    .references(() => beds.id),
  status: allocationStatusEnum("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  allocatedBy: text("allocated_by")
    .notNull()
    .references(() => users.id),
  vacatedAt: timestamp("vacated_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complaints = pgTable("complaints", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => studentProfiles.id),
  roomId: text("room_id").references(() => rooms.id), // optional — could be general
  category: complaintCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: complaintStatusEnum("status").notNull().default("open"),
  resolvedBy: text("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RoomType = (typeof ROOM_TYPES)[number];
export type BedStatus = (typeof BED_STATUSES)[number];
export type AllocationStatus = (typeof ALLOCATION_STATUSES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];
