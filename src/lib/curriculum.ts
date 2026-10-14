import data from "@/content/curriculum.json";
import type { Word } from "./types";
export const words: Word[] = data.words;
export const levels = data.levels;
export const patterns = data.patterns;
export const levelIds = new Set(levels.map((level) => level.id));
export const wordById = new Map(words.map((word) => [word.id, word]));
export function shortLevelName(id: number) {
  return levels.find((level) => level.id === id)?.shortName ?? `Level ${id}`;
}
export const dictationLevels = levels.filter((level) =>
  words.some((word) => word.level === level.id && word.kind !== "word"),
);
