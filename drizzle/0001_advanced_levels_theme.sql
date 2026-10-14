ALTER TABLE "levels" DROP CONSTRAINT "levels_id_range";--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "theme" varchar(10) DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_id_range" CHECK ("levels"."id" between 1 and 13);--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "settings_theme" CHECK ("user_settings"."theme" in ('system', 'light', 'dark'));