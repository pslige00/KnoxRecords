ALTER TYPE "public"."request_status" ADD VALUE 'withdrawn';--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "due_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "due_date_extended_count" integer DEFAULT 0 NOT NULL;