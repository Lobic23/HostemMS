CREATE TYPE "public"."allocation_status" AS ENUM('active', 'vacated', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."bed_status" AS ENUM('available', 'occupied', 'maintenance', 'retired');--> statement-breakpoint
CREATE TYPE "public"."housing_gender" AS ENUM('male', 'female', 'mixed');--> statement-breakpoint
CREATE TABLE "allocations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bed_id" text NOT NULL,
	"status" "allocation_status" DEFAULT 'active' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"vacated_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beds" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"label" text NOT NULL,
	"status" "bed_status" DEFAULT 'available' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"total_floors" integer NOT NULL,
	"gender" "housing_gender" NOT NULL,
	"is_operating" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "buildings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"room_number" text NOT NULL,
	"floor" integer NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_bed_id_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."beds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_active_allocation_per_bed" ON "allocations" USING btree ("bed_id") WHERE status = 'active';--> statement-breakpoint
CREATE INDEX "idx_allocations_user" ON "allocations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_label_per_room" ON "beds" USING btree ("room_id","label");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_room_per_building" ON "rooms" USING btree ("building_id","room_number");