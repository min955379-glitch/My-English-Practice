import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  users,
  learnerBackups,
  sessions,
  attempts,
  words,
  profiles,
  userSettings,
  reviewSchedule,
  userProgress,
} from "@/db/schema";
import { authenticatedUser } from "@/lib/server-auth";
import { isLearnerData } from "@/lib/validation";
import type { LearnerData } from "@/lib/types";
import { mergeSyncedSettings } from "@/lib/sync-settings";
import { levels as curriculumLevels } from "@/lib/curriculum";
import { scheduleReview } from "@/lib/learning";

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user)
    return Response.json({ error: "Please sign in to sync." }, { status: 401 });
  const text = await request.text();
  if (text.length > 2_000_000)
    return Response.json(
      {
        error:
          "This sync batch is too large. Export your progress before clearing it.",
      },
      { status: 413 },
    );
  let incoming: unknown;
  try {
    incoming = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid progress data." }, { status: 400 });
  }
  if (!isLearnerData(incoming))
    return Response.json(
      { error: "Progress data did not pass validation." },
      { status: 400 },
    );
  try {
    const payload = incoming;
    const merged = await getDb().transaction(async (tx) => {
      // Never execute learner queries under the pool's privileged role.
      await tx.execute(sql`set local role authenticated`);
      await tx.execute(
        sql`select set_config('request.jwt.claim.sub', ${user.id}, true), set_config('request.jwt.claims', ${JSON.stringify({ sub: user.id, role: "authenticated" })}, true)`,
      );
      await tx.insert(users).values({ id: user.id }).onConflictDoNothing();
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id}))`);
      const [backup] = await tx
        .select()
        .from(learnerBackups)
        .where(eq(learnerBackups.userId, user.id))
        .for("update");
      const existing = backup?.data;
      const mergedAttempts = [
        ...new Map(
          [...(existing?.attempts ?? []), ...payload.attempts].map((a) => [
            a.id,
            a,
          ]),
        ).values(),
      ].sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt));
      const mergedSessions = [
        ...new Map(
          [...(existing?.sessions ?? []), ...payload.sessions].map((s) => [
            s.id,
            s,
          ]),
        ).values(),
      ];
      const settings = mergeSyncedSettings(payload, existing ?? undefined);
      const reviews: LearnerData["reviews"] = {};
      for (const attempt of mergedAttempts)
        reviews[attempt.wordId] = scheduleReview(
          reviews[attempt.wordId],
          attempt,
          settings.timezone,
        );
      const result: LearnerData = {
        version: 1,
        attempts: mergedAttempts,
        sessions: mergedSessions,
        reviews,
        settings,
      };
      const content = await tx.select().from(words);
      const contentIds = new Map(
        content.map((w) => [`${w.level}:${w.text}`, w.id]),
      );
      for (const session of payload.sessions) {
        const completedWords = new Set(
          payload.attempts
            .filter((a) => a.sessionId === session.id && a.isCorrect)
            .map((a) => a.wordId),
        ).size;
        await tx
          .insert(sessions)
          .values({
            id: session.id,
            userId: user.id,
            startedAt: new Date(session.startedAt),
            endedAt: session.endedAt ? new Date(session.endedAt) : null,
            durationMinutes: Math.floor(session.durationSeconds / 60),
            wordsCompleted: completedWords,
            levelReached: session.level,
          })
          .onConflictDoUpdate({
            target: sessions.id,
            set: {
              endedAt: session.endedAt ? new Date(session.endedAt) : null,
              durationMinutes: Math.floor(session.durationSeconds / 60),
              wordsCompleted: completedWords,
            },
          });
      }
      for (const attempt of payload.attempts) {
        const wordId = contentIds.get(attempt.wordId);
        if (!wordId) throw new Error("Vocabulary has not been seeded");
        await tx
          .insert(attempts)
          .values({
            id: attempt.id,
            userId: user.id,
            sessionId: attempt.sessionId,
            wordId,
            typedAnswer: attempt.typedAnswer,
            isCorrect: attempt.isCorrect,
            isFirstTry: attempt.isFirstTry,
            attemptNumber: Math.max(
              1,
              mergedAttempts.filter(
                (a) =>
                  a.sessionId === attempt.sessionId &&
                  a.wordId === attempt.wordId &&
                  a.attemptedAt <= attempt.attemptedAt,
              ).length,
            ),
            errorsCount: attempt.errorsCount,
            hintsUsed: attempt.hintsUsed,
            completed: attempt.isCorrect,
            timeSpentMs: attempt.timeSpentMs,
            result: attempt.isCorrect ? "success" : "abandoned",
            attemptedAt: new Date(attempt.attemptedAt),
            mistakeType:
              (attempt
                .mistakeTypes[0] as typeof attempts.$inferInsert.mistakeType) ??
              null,
          })
          .onConflictDoNothing();
      }
      await tx
        .insert(profiles)
        .values({
          userId: user.id,
          dailyTargetMinutes: result.settings.dailyTargetMinutes,
          preferredVoice: result.settings.preferredVoice,
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            dailyTargetMinutes: result.settings.dailyTargetMinutes,
            preferredVoice: result.settings.preferredVoice,
          },
        });
      await tx
        .insert(userSettings)
        .values({
          userId: user.id,
          timezone: result.settings.timezone,
          slowSpeechRate: result.settings.slowRate,
          spokenInstructions: result.settings.spokenInstructions,
          theme: result.settings.theme ?? "system",
          voiceGender: result.settings.voiceGender ?? "female",
        })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: {
            timezone: result.settings.timezone,
            slowSpeechRate: result.settings.slowRate,
            spokenInstructions: result.settings.spokenInstructions,
            theme: result.settings.theme ?? "system",
            voiceGender: result.settings.voiceGender ?? "female",
          },
        });
      for (const review of Object.values(reviews)) {
        const wordId = contentIds.get(review.wordId);
        if (!wordId) continue;
        const fields = {
          dueDate: new Date(review.dueDate),
          stability: review.stability,
          difficulty: review.difficulty,
          repetitions: review.repetitions,
          intervalDays: review.intervalDays,
          lastReviewedAt: new Date(review.lastReviewedAt),
          state: "review" as const,
        };
        await tx
          .insert(reviewSchedule)
          .values({ userId: user.id, wordId, ...fields })
          .onConflictDoUpdate({
            target: [reviewSchedule.userId, reviewSchedule.wordId],
            set: fields,
          });
      }
      for (const { id: levelId } of curriculumLevels) {
        const levelContent = content.filter((w) => w.level === levelId);
        const localIds = new Set(
          levelContent.map((w) => `${w.level}:${w.text}`),
        );
        const levelAttempts = mergedAttempts.filter((a) =>
          localIds.has(a.wordId),
        );
        const counters = {
          wordsCompleted: new Set(
            levelAttempts.filter((a) => a.isCorrect).map((a) => a.wordId),
          ).size,
          wordsMastered: Object.values(reviews).filter(
            (r) => localIds.has(r.wordId) && r.mastered,
          ).length,
          totalAttempts: levelAttempts.length,
          firstTryCorrect: levelAttempts.filter((a) => a.isFirstTry).length,
        };
        await tx
          .insert(userProgress)
          .values({ userId: user.id, levelId, ...counters })
          .onConflictDoUpdate({
            target: [userProgress.userId, userProgress.levelId],
            set: counters,
          });
      }
      await tx
        .insert(learnerBackups)
        .values({ userId: user.id, data: result })
        .onConflictDoUpdate({
          target: learnerBackups.userId,
          set: { data: result, updatedAt: new Date() },
        });
      return result;
    });
    return Response.json(merged, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { error: "Cloud sync is unavailable. Your local progress is unchanged." },
      { status: 503 },
    );
  }
}
