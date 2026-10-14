import type { VoiceGender } from "./voices";
import type { ThemeChoice } from "./theme";

export type Word = {
  id: string;
  text: string;
  level: number;
  phonetic: string;
  syllables: string[];
  syllableSplit: string;
  stressPattern: string;
  syllableCount: number;
  patternCategory: string;
  wordFamily: string;
  meaning: string;
  example: string;
  kind: string;
};
export type Attempt = {
  id: string;
  wordId: string;
  sessionId: string;
  typedAnswer: string;
  isCorrect: boolean;
  isFirstTry: boolean;
  errorsCount: number;
  hintsUsed: number;
  timeSpentMs: number;
  attemptedAt: string;
  mistakeTypes: string[];
  mistakes: { expected: string; typed: string; position: number }[];
  mode: "spelling" | "dictation" | "phonics";
};
export type PracticeSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  level: number;
  wordIds: string[];
  cursor: number;
  completed: boolean;
  wordCompleted?: boolean;
  mode?: "spelling" | "dictation" | "phonics";
  pattern?: string;
  draft?: {
    wordId: string;
    index: number;
    bad: string;
    errors: number;
    hints: number;
    mistakes: Attempt["mistakes"];
    elapsedMs: number;
  };
};
export type Review = {
  wordId: string;
  dueDate: string;
  stability: number;
  difficulty: number;
  repetitions: number;
  intervalDays: number;
  lastReviewedAt: string;
  successfulDates: string[];
  mastered: boolean;
  lastMistake?: string;
};
export type Settings = {
  theme?: ThemeChoice;
  voiceGender?: VoiceGender; // Legacy version-1 exports may omit this.
  updatedAt?: string; // Optional only for compatibility with legacy exports.
  dailyTargetMinutes: number;
  preferredVoice: string;
  slowRate: number;
  spokenInstructions: boolean;
  timezone: string;
};
export type LearnerData = {
  version: 1;
  attempts: Attempt[];
  sessions: PracticeSession[];
  reviews: Record<string, Review>;
  settings: Settings;
};
