CREATE TABLE "app_settings" (
	"id" varchar(32) PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"id_auto_approve_threshold" real DEFAULT 0.85 NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;