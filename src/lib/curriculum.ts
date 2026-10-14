import data from "@/content/curriculum.json";
import type { Word } from "./types";
export const words: Word[] = data.words;
export const levels = data.levels;
export const patterns = data.patterns;
export const wordById = new Map(words.map((word) => [word.id, word]));
export function shortLevelName(id: number) {
  return [
    "Short vowel words",
    "Silent e & long vowels",
    "Double consonants",
    "Common digraphs",
    "Consonant blends",
    "Syllables & stress",
    "Tricky spellings",
    "Dictation & phrases",
  ][id - 1];
}
