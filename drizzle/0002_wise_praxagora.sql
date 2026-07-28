ALTER TABLE "users" ADD COLUMN "role_changed_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_changed_by_users_id_fk" FOREIGN KEY ("role_changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;