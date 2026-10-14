CREATE TYPE "public"."attempt_result" AS ENUM('success', 'mistake', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."content_kind" AS ENUM('word', 'phrase', 'sentence');--> statement-breakpoint
CREATE TYPE "public"."mistake_type" AS ENUM('vowel_confusion', 'consonant_confusion', 'missing_letter', 'extra_letter', 'double_letter', 'silent_letter', 'transposition', 'spacing', 'other');--> statement-breakpoint
CREATE TYPE "public"."review_state" AS ENUM('new', 'learning', 'review', 'relearning');--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"word_id" integer NOT NULL,
	"session_id" uuid NOT NULL,
	"typed_answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"is_first_try" boolean NOT NULL,
	"mistake_type" "mistake_type",
	"letter_position" integer,
	"attempt_number" integer NOT NULL,
	"errors_count" integer DEFAULT 0 NOT NULL,
	"hints_used" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"time_spent_ms" integer DEFAULT 0 NOT NULL,
	"result" "attempt_result" NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempts_counts_valid" CHECK ("attempts"."attempt_number" > 0 and "attempts"."errors_count" >= 0 and "attempts"."hints_used" between 0 and 3 and "attempts"."time_spent_ms" >= 0),
	CONSTRAINT "attempts_position_valid" CHECK ("attempts"."letter_position" >= 0),
	CONSTRAINT "attempts_first_try_valid" CHECK (not "attempts"."is_first_try" or ("attempts"."is_correct" and "attempts"."completed" and "attempts"."errors_count" = 0 and "attempts"."hints_used" = 0 and "attempts"."attempt_number" = 1)),
	CONSTRAINT "attempts_result_valid" CHECK (("attempts"."result" = 'success' and "attempts"."is_correct" and "attempts"."completed") or ("attempts"."result" in ('mistake', 'abandoned') and not "attempts"."is_correct"))
);
--> statement-breakpoint
ALTER TABLE "attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "learner_backups" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "learner_backups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "levels" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"unlock_accuracy_percent" integer DEFAULT 80 NOT NULL,
	"required_sessions" integer DEFAULT 3 NOT NULL,
	"recent_session_window_hours" integer DEFAULT 48 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "levels_id_range" CHECK ("levels"."id" between 1 and 8),
	CONSTRAINT "levels_accuracy_range" CHECK ("levels"."unlock_accuracy_percent" between 0 and 100),
	CONSTRAINT "levels_session_count" CHECK ("levels"."required_sessions" >= 0),
	CONSTRAINT "levels_recent_window" CHECK ("levels"."recent_session_window_hours" > 0)
);
--> statement-breakpoint
ALTER TABLE "levels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "phonics_patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"example_words" jsonb NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "phonics_patterns_category_unique" UNIQUE("category")
);
--> statement-breakpoint
ALTER TABLE "phonics_patterns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" varchar(100),
	"preferred_voice" varchar(255),
	"daily_target_minutes" integer DEFAULT 20 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_daily_target" CHECK ("profiles"."daily_target_minutes" between 15 and 25)
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "review_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"word_id" integer NOT NULL,
	"due_date" timestamp with time zone DEFAULT now() NOT NULL,
	"stability" double precision DEFAULT 0 NOT NULL,
	"difficulty" double precision DEFAULT 0 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"elapsed_days" integer DEFAULT 0 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"learning_steps" integer DEFAULT 0 NOT NULL,
	"state" "review_state" DEFAULT 'new' NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_owner_word_unique" UNIQUE("user_id","word_id"),
	CONSTRAINT "review_parameters_valid" CHECK ("review_schedule"."stability" >= 0 and "review_schedule"."difficulty" between 0 and 10),
	CONSTRAINT "review_counts_valid" CHECK ("review_schedule"."repetitions" >= 0 and "review_schedule"."lapses" >= 0 and "review_schedule"."elapsed_days" >= 0 and "review_schedule"."interval_days" >= 0 and "review_schedule"."learning_steps" >= 0)
);
--> statement-breakpoint
ALTER TABLE "review_schedule" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_minutes" integer,
	"words_completed" integer DEFAULT 0 NOT NULL,
	"accuracy_percent" double precision,
	"level_reached" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_id_owner_unique" UNIQUE("id","user_id"),
	CONSTRAINT "sessions_duration_valid" CHECK ("sessions"."duration_minutes" >= 0),
	CONSTRAINT "sessions_words_valid" CHECK ("sessions"."words_completed" >= 0),
	CONSTRAINT "sessions_accuracy_valid" CHECK ("sessions"."accuracy_percent" between 0 and 100),
	CONSTRAINT "sessions_dates_valid" CHECK ("sessions"."ended_at" >= "sessions"."started_at")
);
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"level_id" integer NOT NULL,
	"unlocked_at" timestamp with time zone,
	"words_completed" integer DEFAULT 0 NOT NULL,
	"words_mastered" integer DEFAULT 0 NOT NULL,
	"first_try_correct" integer DEFAULT 0 NOT NULL,
	"total_attempts" integer DEFAULT 0 NOT NULL,
	"qualifying_sessions" integer DEFAULT 0 NOT NULL,
	"last_practised_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "progress_owner_level_unique" UNIQUE("user_id","level_id"),
	CONSTRAINT "progress_counts_valid" CHECK ("user_progress"."words_completed" >= 0 and "user_progress"."words_mastered" between 0 and "user_progress"."words_completed" and "user_progress"."first_try_correct" between 0 and "user_progress"."total_attempts" and "user_progress"."qualifying_sessions" >= 0)
);
--> statement-breakpoint
ALTER TABLE "user_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"timezone" varchar(100) DEFAULT 'UTC' NOT NULL,
	"language" varchar(10) DEFAULT 'en-GB' NOT NULL,
	"slow_speech_rate" double precision DEFAULT 0.65 NOT NULL,
	"microphone_enabled" boolean DEFAULT false NOT NULL,
	"spoken_instructions" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_british_english" CHECK ("user_settings"."language" = 'en-GB'),
	CONSTRAINT "settings_slow_rate" CHECK ("user_settings"."slow_speech_rate" between 0.6 and 0.75)
);
--> statement-breakpoint
ALTER TABLE "user_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "words" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar(255) NOT NULL,
	"phonetic" varchar(255) NOT NULL,
	"syllables" jsonb NOT NULL,
	"syllable_count" integer NOT NULL,
	"syllable_split" varchar(255) NOT NULL,
	"stress_pattern" varchar(100) NOT NULL,
	"level" integer NOT NULL,
	"pattern_category" varchar(50) NOT NULL,
	"word_family" varchar(100) NOT NULL,
	"meaning" text NOT NULL,
	"example" text NOT NULL,
	"kind" "content_kind" DEFAULT 'word' NOT NULL,
	"audio_url" text,
	"normal_audio_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "words_level_text_unique" UNIQUE("level","text"),
	CONSTRAINT "words_nonempty" CHECK (length(trim("words"."text")) > 0),
	CONSTRAINT "words_syllables_valid" CHECK ("words"."syllable_count" > 0 and jsonb_array_length("words"."syllables") = "words"."syllable_count")
);
--> statement-breakpoint
ALTER TABLE "words" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_session_owner_fk" FOREIGN KEY ("session_id","user_id") REFERENCES "public"."sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_backups" ADD CONSTRAINT "learner_backups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_schedule" ADD CONSTRAINT "review_schedule_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_schedule" ADD CONSTRAINT "review_schedule_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_level_reached_levels_id_fk" FOREIGN KEY ("level_reached") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_level_levels_id_fk" FOREIGN KEY ("level") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_pattern_category_phonics_patterns_category_fk" FOREIGN KEY ("pattern_category") REFERENCES "public"."phonics_patterns"("category") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_owner_time_idx" ON "attempts" USING btree ("user_id","attempted_at");--> statement-breakpoint
CREATE INDEX "attempts_owner_word_idx" ON "attempts" USING btree ("user_id","word_id");--> statement-breakpoint
CREATE INDEX "attempts_session_idx" ON "attempts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "review_owner_due_idx" ON "review_schedule" USING btree ("user_id","due_date");--> statement-breakpoint
CREATE INDEX "sessions_owner_started_idx" ON "sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "words_level_active_idx" ON "words" USING btree ("level","is_active");--> statement-breakpoint
CREATE INDEX "words_pattern_idx" ON "words" USING btree ("pattern_category");--> statement-breakpoint
CREATE POLICY "attempts_select_own" ON "attempts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "attempts_insert_own" ON "attempts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "learner_backups_manage_own" ON "learner_backups" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "levels_read" ON "levels" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "phonics_patterns_read" ON "phonics_patterns" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "profiles_manage_own" ON "profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "review_manage_own" ON "review_schedule" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "sessions_manage_own" ON "sessions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "progress_manage_own" ON "user_progress" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "settings_manage_own" ON "user_settings" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "users_select_own" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "users"."id");--> statement-breakpoint
CREATE POLICY "users_insert_own" ON "users" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "users"."id");--> statement-breakpoint
CREATE POLICY "words_read_active" ON "words" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ("words"."is_active");
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO anon, authenticated;
--> statement-breakpoint
GRANT SELECT ON public.levels, public.words, public.phonics_patterns TO anon, authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT ON public.users, public.attempts TO authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.user_settings, public.sessions, public.review_schedule, public.user_progress, public.learner_backups TO authenticated;
