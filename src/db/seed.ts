import { pathToFileURL } from "node:url";
import curriculum from "../content/curriculum.json";
import { getDb, closeDb } from "./index";
import { levels, phonicsPatterns, words, type NewWord } from "./schema";

export const levelSeed: (typeof levels.$inferInsert)[] = curriculum.levels;
export const patternSeed: (typeof phonicsPatterns.$inferInsert)[] =
  curriculum.patterns;
export const wordSeed: NewWord[] = curriculum.words.map(({ id, ...word }) => {
  void id;
  return { ...word, kind: word.kind as NewWord["kind"] };
});
const patternDescriptions = Object.fromEntries(
  patternSeed.map((pattern) => [pattern.category, pattern.description]),
);

export function validateSeed(): void {
  const keys = new Set<string>();
  for (const level of levelSeed) {
    if (wordSeed.filter((word) => word.level === level.id).length < 5) {
      throw new Error(`Level ${level.id} needs at least five practice items.`);
    }
  }
  for (const word of wordSeed) {
    const key = `${word.level}:${word.text}`;
    if (keys.has(key)) throw new Error(`Duplicate seed item: ${key}`);
    keys.add(key);
    if (!patternDescriptions[word.patternCategory]) {
      throw new Error(`Unknown pattern for ${word.text}.`);
    }
    if (word.stressPattern.split("-").length !== word.syllableCount) {
      throw new Error(`Syllable and stress counts differ for ${word.text}.`);
    }
  }
}

export async function seedDatabase(): Promise<void> {
  validateSeed();
  const db = getDb();
  await db.transaction(async (tx) => {
    for (const level of levelSeed) {
      await tx
        .insert(levels)
        .values(level)
        .onConflictDoUpdate({
          target: levels.id,
          set: {
            ...level,
            unlockAccuracyPercent: level.unlockAccuracyPercent ?? 80,
            requiredSessions: level.requiredSessions ?? 3,
            recentSessionWindowHours: 48,
            updatedAt: new Date(),
          },
        });
    }
    for (const pattern of patternSeed) {
      await tx
        .insert(phonicsPatterns)
        .values(pattern)
        .onConflictDoUpdate({
          target: phonicsPatterns.category,
          set: { ...pattern, updatedAt: new Date() },
        });
    }
    for (const word of wordSeed) {
      await tx
        .insert(words)
        .values(word)
        .onConflictDoUpdate({
          target: [words.level, words.text],
          set: { ...word, updatedAt: new Date() },
        });
    }
  });
  console.info(
    `Seeded ${levelSeed.length} levels, ${wordSeed.length} practice items and ${patternSeed.length} patterns.`,
  );
}

// Run with DATABASE_URL exported, or: node --env-file=.env.local --import tsx src/db/seed.ts
const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  seedDatabase()
    .catch(() => {
      // Avoid printing connection details or credentials from driver errors.
      console.error(
        "Seeding failed. Check DATABASE_URL, database access and applied migrations.",
      );
      process.exitCode = 1;
    })
    .finally(closeDb);
}
