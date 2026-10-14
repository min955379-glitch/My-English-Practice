import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgSchema,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Supabase owns this table. Do not export it or migrate the auth schema.
const authUsers = pgSchema("auth").table("users", {
  id: uuid("id").primaryKey(),
});

export const attemptResult = pgEnum("attempt_result", [
  "success",
  "mistake",
  "abandoned",
]);
export const mistakeType = pgEnum("mistake_type", [
  "vowel_confusion",
  "consonant_confusion",
  "missing_letter",
  "extra_letter",
  "double_letter",
  "silent_letter",
  "transposition",
  "spacing",
  "other",
]);
export const reviewState = pgEnum("review_state", [
  "new",
  "learning",
  "review",
  "relearning",
]);
export const contentKind = pgEnum("content_kind", [
  "word",
  "phrase",
  "sentence",
]);

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const ownRows = (name: string) =>
  pgPolicy(name, {
    for: "all",
    to: "authenticated",
    using: sql`(select auth.uid()) = user_id`,
    withCheck: sql`(select auth.uid()) = user_id`,
  });
const readContent = (name: string) =>
  pgPolicy(name, {
    for: "select",
    to: ["anon", "authenticated"],
    using: sql`true`,
  });

// Application identity only; passwords and email remain in Supabase Auth.
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    ...timestamps(),
  },
  (table) => [
    pgPolicy("users_select_own", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.uid()) = ${table.id}`,
    }),
    pgPolicy("users_insert_own", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(select auth.uid()) = ${table.id}`,
    }),
  ],
).enableRLS();

export const levels = pgTable(
  "levels",
  {
    id: integer("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),
    unlockAccuracyPercent: integer("unlock_accuracy_percent")
      .notNull()
      .default(80),
    requiredSessions: integer("required_sessions").notNull().default(3),
    recentSessionWindowHours: integer("recent_session_window_hours")
      .notNull()
      .default(48),
    ...timestamps(),
  },
  (table) => [
    check("levels_id_range", sql`${table.id} between 1 and 8`),
    check(
      "levels_accuracy_range",
      sql`${table.unlockAccuracyPercent} between 0 and 100`,
    ),
    check("levels_session_count", sql`${table.requiredSessions} >= 0`),
    check("levels_recent_window", sql`${table.recentSessionWindowHours} > 0`),
    readContent("levels_read"),
  ],
).enableRLS();

export const phonicsPatterns = pgTable(
  "phonics_patterns",
  {
    id: serial("id").primaryKey(),
    category: varchar("category", { length: 50 }).notNull().unique(),
    description: text("description").notNull(),
    exampleWords: jsonb("example_words").$type<string[]>().notNull(),
    orderIndex: integer("order_index").notNull(),
    ...timestamps(),
  },
  () => [readContent("phonics_patterns_read")],
).enableRLS();

export const words = pgTable(
  "words",
  {
    id: serial("id").primaryKey(),
    text: varchar("text", { length: 255 }).notNull(),
    phonetic: varchar("phonetic", { length: 255 }).notNull(),
    syllables: jsonb("syllables").$type<string[]>().notNull(),
    syllableCount: integer("syllable_count").notNull(),
    syllableSplit: varchar("syllable_split", { length: 255 }).notNull(),
    stressPattern: varchar("stress_pattern", { length: 100 }).notNull(),
    level: integer("level")
      .notNull()
      .references(() => levels.id),
    patternCategory: varchar("pattern_category", { length: 50 })
      .notNull()
      .references(() => phonicsPatterns.category),
    wordFamily: varchar("word_family", { length: 100 }).notNull(),
    meaning: text("meaning").notNull(),
    example: text("example").notNull(),
    kind: contentKind("kind").notNull().default("word"),
    audioUrl: text("audio_url"),
    normalAudioUrl: text("normal_audio_url"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    unique("words_level_text_unique").on(table.level, table.text),
    index("words_level_active_idx").on(table.level, table.isActive),
    index("words_pattern_idx").on(table.patternCategory),
    check("words_nonempty", sql`length(trim(${table.text})) > 0`),
    check(
      "words_syllables_valid",
      sql`${table.syllableCount} > 0 and jsonb_array_length(${table.syllables}) = ${table.syllableCount}`,
    ),
    pgPolicy("words_read_active", {
      for: "select",
      to: ["anon", "authenticated"],
      using: sql`${table.isActive}`,
    }),
  ],
).enableRLS();

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 100 }),
    preferredVoice: varchar("preferred_voice", { length: 255 }),
    dailyTargetMinutes: integer("daily_target_minutes").notNull().default(20),
    ...timestamps(),
  },
  (table) => [
    check(
      "profiles_daily_target",
      sql`${table.dailyTargetMinutes} between 15 and 25`,
    ),
    ownRows("profiles_manage_own"),
  ],
).enableRLS();

export const userSettings = pgTable(
  "user_settings",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    timezone: varchar("timezone", { length: 100 }).notNull().default("UTC"),
    language: varchar("language", { length: 10 }).notNull().default("en-GB"),
    slowSpeechRate: doublePrecision("slow_speech_rate").notNull().default(0.65),
    microphoneEnabled: boolean("microphone_enabled").notNull().default(false),
    spokenInstructions: boolean("spoken_instructions").notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    check("settings_british_english", sql`${table.language} = 'en-GB'`),
    check(
      "settings_slow_rate",
      sql`${table.slowSpeechRate} between 0.6 and 0.75`,
    ),
    ownRows("settings_manage_own"),
  ],
).enableRLS();

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationMinutes: integer("duration_minutes"),
    wordsCompleted: integer("words_completed").notNull().default(0),
    accuracyPercent: doublePrecision("accuracy_percent"),
    levelReached: integer("level_reached")
      .notNull()
      .default(1)
      .references(() => levels.id),
    ...timestamps(),
  },
  (table) => [
    unique("sessions_id_owner_unique").on(table.id, table.userId),
    index("sessions_owner_started_idx").on(table.userId, table.startedAt),
    check("sessions_duration_valid", sql`${table.durationMinutes} >= 0`),
    check("sessions_words_valid", sql`${table.wordsCompleted} >= 0`),
    check(
      "sessions_accuracy_valid",
      sql`${table.accuracyPercent} between 0 and 100`,
    ),
    check("sessions_dates_valid", sql`${table.endedAt} >= ${table.startedAt}`),
    ownRows("sessions_manage_own"),
  ],
).enableRLS();

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: integer("word_id")
      .notNull()
      .references(() => words.id),
    sessionId: uuid("session_id").notNull(),
    typedAnswer: text("typed_answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    isFirstTry: boolean("is_first_try").notNull(),
    mistakeType: mistakeType("mistake_type"),
    letterPosition: integer("letter_position"),
    attemptNumber: integer("attempt_number").notNull(),
    errorsCount: integer("errors_count").notNull().default(0),
    hintsUsed: integer("hints_used").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    timeSpentMs: integer("time_spent_ms").notNull().default(0),
    result: attemptResult("result").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestamps(),
  },
  (table) => [
    foreignKey({
      name: "attempts_session_owner_fk",
      columns: [table.sessionId, table.userId],
      foreignColumns: [sessions.id, sessions.userId],
    }).onDelete("cascade"),
    index("attempts_owner_time_idx").on(table.userId, table.attemptedAt),
    index("attempts_owner_word_idx").on(table.userId, table.wordId),
    index("attempts_session_idx").on(table.sessionId),
    check(
      "attempts_counts_valid",
      sql`${table.attemptNumber} > 0 and ${table.errorsCount} >= 0 and ${table.hintsUsed} between 0 and 3 and ${table.timeSpentMs} >= 0`,
    ),
    check("attempts_position_valid", sql`${table.letterPosition} >= 0`),
    check(
      "attempts_first_try_valid",
      sql`not ${table.isFirstTry} or (${table.isCorrect} and ${table.completed} and ${table.errorsCount} = 0 and ${table.hintsUsed} = 0 and ${table.attemptNumber} = 1)`,
    ),
    check(
      "attempts_result_valid",
      sql`(${table.result} = 'success' and ${table.isCorrect} and ${table.completed}) or (${table.result} in ('mistake', 'abandoned') and not ${table.isCorrect})`,
    ),
    pgPolicy("attempts_select_own", {
      for: "select",
      to: "authenticated",
      using: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("attempts_insert_own", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`(select auth.uid()) = user_id`,
    }),
  ],
).enableRLS();

export const reviewSchedule = pgTable(
  "review_schedule",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: integer("word_id")
      .notNull()
      .references(() => words.id),
    dueDate: timestamp("due_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    stability: doublePrecision("stability").notNull().default(0),
    difficulty: doublePrecision("difficulty").notNull().default(0),
    repetitions: integer("repetitions").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    elapsedDays: integer("elapsed_days").notNull().default(0),
    intervalDays: integer("interval_days").notNull().default(0),
    learningSteps: integer("learning_steps").notNull().default(0),
    state: reviewState("state").notNull().default("new"),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    unique("review_owner_word_unique").on(table.userId, table.wordId),
    index("review_owner_due_idx").on(table.userId, table.dueDate),
    // New FSRS cards have zeroed parameters; learned-card ranges come from FSRS.
    check(
      "review_parameters_valid",
      sql`${table.stability} >= 0 and ${table.difficulty} between 0 and 10`,
    ),
    check(
      "review_counts_valid",
      sql`${table.repetitions} >= 0 and ${table.lapses} >= 0 and ${table.elapsedDays} >= 0 and ${table.intervalDays} >= 0 and ${table.learningSteps} >= 0`,
    ),
    ownRows("review_manage_own"),
  ],
).enableRLS();

export const userProgress = pgTable(
  "user_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    levelId: integer("level_id")
      .notNull()
      .references(() => levels.id),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }),
    wordsCompleted: integer("words_completed").notNull().default(0),
    wordsMastered: integer("words_mastered").notNull().default(0),
    firstTryCorrect: integer("first_try_correct").notNull().default(0),
    totalAttempts: integer("total_attempts").notNull().default(0),
    qualifyingSessions: integer("qualifying_sessions").notNull().default(0),
    lastPractisedOn: date("last_practised_on"),
    ...timestamps(),
  },
  (table) => [
    unique("progress_owner_level_unique").on(table.userId, table.levelId),
    check(
      "progress_counts_valid",
      sql`${table.wordsCompleted} >= 0 and ${table.wordsMastered} between 0 and ${table.wordsCompleted} and ${table.firstTryCorrect} between 0 and ${table.totalAttempts} and ${table.qualifyingSessions} >= 0`,
    ),
    ownRows("progress_manage_own"),
  ],
).enableRLS();

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type ReviewSchedule = typeof reviewSchedule.$inferSelect;

// Versioned local-first snapshot. Normalised tables remain the reporting model.
export const learnerBackups = pgTable(
  "learner_backups",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    data: jsonb("data").$type<import("../lib/types").LearnerData>().notNull(),
    ...timestamps(),
  },
  () => [ownRows("learner_backups_manage_own")],
).enableRLS();
