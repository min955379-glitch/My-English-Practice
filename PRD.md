# Product Requirements Document (PRD)
# My English Practice

| Field | Value |
|---|---|
| Product Name | My English Practice |
| Version | 1.0.0 |
| Last Updated | 2026-01-15 |
| Author | Lead Developer, Arena Next.js Team |
| Status | Active Development — Phase 1 MVP |

---

## 1. Product Overview

My English Practice is a focused, supportive British-English spelling and pronunciation practice website designed specifically for adult beginners (A1–A2 CEFR). The core premise is simple: the user listens to a spoken British English word (normal speed, then slowed), then types it letter by letter. The system validates each keystroke in real time — wrong letters turn red with a calm, plain message — and blocks progression until the word is spelled correctly. After two failed attempts on the same word, a structured hint ladder activates to prevent frustration. The experience is calm, private, and entirely self-paced, with no public leaderboards or competitive pressure.

The platform spans four progressive feature sets:

1. **Core Listen-and-Spell Drill** — the beating heart of the product.
2. **Phonics, Syllables, and Pattern Work** — structural awareness of English spelling.
3. **Dictation and Microphone Speak-and-Check** — receptive and productive fluency.
4. **FSRS Spaced Repetition and Progress Tracking** — long-term retention and daily habit formation.

The entire site is free, runs on a modern React + TypeScript + Vite foundation (with Next.js App Router as the production runtime), connects to PostgreSQL through Drizzle ORM, and relies on browser speech synthesis (`en-GB`) and the Web Speech API where available. All user data is protected by Supabase Auth with row-level security.

---

## 2. Target User and Exact Problems

### Primary Persona: Adult Beginner Learner

**Demographics and Context:**

- Age: 25–55.
- Native language: non-English (variety of L1s; no assumption of phonetic alphabet knowledge).
- English level: very weak A1, struggling to read English smoothly.
- Learning context: self-directed, often in short windows at home or during a commute break. No classroom support.
- Technology comfort: basic smartphone or laptop user; can type slowly but reliably; no prior experience with language-learning apps.

**Exact Problems (Observed, Not Assumed):**

1. **Very Weak Spelling Memory.** The user can recognise common words (e.g., "hello", "thank") in isolation, but cannot reproduce them from memory. Spelling errors are systematic: double-letter omissions ("hello" → "helo"), silent-letter omissions ("night" → "nit"), vowel confusion ("cat" vs. "cut"), and transposition ("friend" → "freind").
2. **Cannot Read English Smoothly.** Reading aloud is slow and effortful. The user does not yet have reliable grapheme-to-phoneme mapping for common British English patterns (e.g., the long "a" in "name", the silent "e" effect, the "ch" vs. "sh" distinction). This creates a negative feedback loop: poor spelling reinforces poor reading, and poor reading prevents vocabulary acquisition.
3. **Fear of Mistakes.** In traditional classroom or competitive app contexts, repeated errors are stigmatised. Our user avoids practice that feels punishing. A calm interface without red crosses, buzzers, or public scores is a clinical requirement, not a stylistic preference.
4. **No Structured Practice Routine.** The user knows they should practise daily but lacks a system that tells them what to practise, for how long, and whether it is working. Without visible progress, motivation collapses after 3–5 days.
5. **Limited Access to Native-Speaker Audio.** The user lives in an environment with minimal native English exposure. They need a reliable, always-available British English voice — not American, not mixed — to establish a consistent auditory model.

---

## 3. Goals and Non-Goals

### Goals (What We Will Build)

- A calm, private, 15–25 minute daily session that teaches British English spelling through a listen-then-type drill.
- Real-time letter-by-letter validation with red highlighting and plain, non-judgemental messages.
- Normal-speed and slow-speed audio playback for every word, with the slow version always available after the first attempt.
- A structured hint ladder activated after 2 consecutive failures, providing progressive support (sound cue, letter reveal, syllable break) without giving the full answer.
- A microphone-based "speak and check" feature that acts solely as a supportive hint within the drill, not as an assessment gate.
- FSRS-based spaced repetition scheduling that surfaces previously misspelled words at mathematically optimised intervals.
- A progress dashboard with session length, accuracy percentage, words completed, level progress, and streak tracking.
- 8 progressive levels that unlock sequentially based on mastery criteria.
- Offline-capable core drill so that a session can continue through brief connectivity loss.
- Supabase Auth with row-level security ensuring users only see their own data.

### Non-Goals (What We Will Not Build)

- Real-time multiplayer or social features. No leaderboards, no friend lists, no chat.
- Full-course grammar instruction. This is a spelling and pronunciation practice tool, not a comprehensive English course.
- American English pronunciation. The audio model is `en-GB` only.
- AI-generated adaptive content. The word list is curated, not dynamically generated.
- Native mobile apps. The product is a responsive web app, deliverable through any modern browser.
- Revenue model requiring payment. The site is free; monetisation (if pursued) will be through unobtrusive display advertising (AdSense-ready structure) and never through paywalls on core drills.
- Professional speech-therapy assessment. The microphone feature is a practice aid, not a clinical pronunciation evaluation tool.

---

## 4. User Stories

### Epic 1: Core Drill

- **US-01:** As an adult beginner, I want to hear a word spoken in normal British English speed, then at a slower speed, so that I can match the sound to letters confidently.
- **US-02:** As a user with weak spelling, I want to type one letter at a time and see wrong letters turn red immediately, so that I correct my mistake before it compounds.
- **US-03:** As a user with weak spelling, I want to be blocked from finishing a word until it is spelled correctly, so that I never leave a session with an uncorrected error.
- **US-04:** As a user who struggles, I want a calm, plain message (not an alarm or buzzer) when I make a mistake, so that I do not feel shamed and can continue.
- **US-05:** As a user who fails twice on the same word, I want a hint ladder (sound replay, first letter reveal, syllable split) to help me succeed without giving the full answer, so that I still learn.

### Epic 2: Practice Structure and Fluency

- **US-06:** As a beginner, I want to practise phonics patterns (e.g., silent "e", double consonants) separately from random vocabulary, so that I understand the rules behind spelling.
- **US-07:** As a learner, I want to see how a word is broken into syllables with stress markers, so that I can link sound patterns to letter groups.
- **US-08:** As a user improving fluency, I want a dictation mode where I hear a sentence or phrase and must type it fully, so that I practise spelling in context.
- **US-09:** As a user with a microphone, I want to say a word aloud and receive a supportive hint comparing my attempt to the target, so that I build oral confidence without fear of failure.

### Epic 3: Memory and Routine

- **US-10:** As a returning user, I want previously misspelled words to reappear at spaced intervals (FSRS scheduling), so that my mistakes become long-term strengths.
- **US-11:** As a daily practitioner, I want a 15–25 minute session that selects the right mix of new, review, and mastered words, so that I do not have to plan my own practice.
- **US-12:** As a motivated learner, I want a dashboard showing my session duration, accuracy rate, words completed, level progress, and consecutive-day streak, so that I can see tangible improvement.

---

## 5. Functional Requirements

### 5.1 Core Listen-and-Spell Drill — Step-by-Step Behaviour

**Step 1: Word Selection**

The session engine selects the next word from the user's current level queue, mixing new words (60%), FSRS review words (25%), and recent mistakes (15%). The selection respects the 8-level progression: a user cannot see Level 3 words until Level 2 mastery is confirmed.

**Step 2: Audio Playback — Normal Speed**

On word load, the system plays the British English (`en-GB`) audio at normal speech rate. The audio source is browser speech synthesis (`SpeechSynthesis`) using a `en-GB` voice (`lang="en-GB"`, `voiceURI` preferred: "Google UK English Female", "Microsoft Hazel", or fallback to the highest-priority `en-GB` voice available). The play button is available for replay without penalty.

**Step 3: Audio Playback — Slow Speed**

After the first attempt (or immediately if the user clicks "Slow"), the system plays the same word at a reduced rate. Implementation: a separate pre-rendered slow audio file is preferred for consistency; where unavailable, `SpeechSynthesis` rate is set to `0.6` – `0.75` on the `en-GB` voice. Slow playback does not reveal any letters.

**Step 4: Letter-by-Letter Input**

The user types into a character input field. Each keystroke triggers immediate validation:

- If the typed letter matches the target word at the current index, it displays in neutral colour and the cursor advances.
- If the typed letter does not match the target, it turns red (`#ef4444` or equivalent), the cursor remains at the same index, and a calm plain message appears below the word: for example, "Not quite. Try that letter again." No sound effect plays. The message is a text-only, non-animated banner in a muted tone.
- The user cannot skip ahead, paste, or autocomplete. Only individual character input is accepted.

**Step 5: Blocking Rule**

If any letter is incorrect, the user is blocked from completing the word. The incorrect letter must be corrected (either by backspacing and retyping, or by typing the correct letter which overwrites the red letter at the same index) before the cursor can advance to the next position. There is no "skip" or "reveal" button until the hint ladder activates.

**Step 6: Completion**

When the final correct letter is entered, the word displays fully in a calm confirmation colour (`#0ea5e9`) for 1.5 seconds, followed by a brief "Next" transition. No points, stars, or celebratory animations appear — the design philosophy is calm and adult-oriented.

**Step 7: Attempt Recording**

Every interaction is recorded: word ID, user ID, attempt timestamp, number of errors, number of hints used, total time spent on the word, and whether the word was completed successfully. This feeds both the FSRS scheduling engine and the progress dashboard.

### 5.2 Audio Normal / Slow Behaviour — Edge Cases

- **Voice Unavailable:** If no `en-GB` voice is installed on the device, the system falls back to the best available `en` voice, logs a non-blocking warning in the developer console, and displays a subtle message to the user: "Using standard English voice." The exercise continues.
- **SpeechSynthesis Disabled:** If the browser disables or does not support `SpeechSynthesis`, the user sees a persistent banner: "Audio unavailable in this browser. You may still practise spelling." The core drill remains functional without audio.
- **Slow Audio Missing:** If a pre-rendered slow audio file fails to load, the system falls back to `SpeechSynthesis` with `rate=0.65`. A non-blocking error is logged.
- **Replay Abuse:** The replay button is unlimited but does not trigger a new attempt record. Only the initial audio play on word load is tracked.

### 5.3 Hint Ladder Rules

The hint ladder activates only after **two consecutive failures** on the **same word within a single session**. A "failure" is defined as a completed attempt where at least one letter was typed incorrectly (even if the word was eventually corrected). If the user completes the word on the first or second attempt, the ladder never activates for that word.

When activated, the ladder provides three progressive levels of support, delivered one at a time with user interaction:

1. **Level 1 — Replay with Emphasis:** The word is replayed at normal speed with a slightly extended pause before the first syllable and after the last syllable (`pitch` or `prosody` adjustments where supported). The user must attempt the word again before accessing Level 2.
2. **Level 2 — First Letter Reveal:** The first letter of the word is revealed in the input field. The user must attempt the remaining letters. If a second failure occurs, the ladder remains active but does not reveal additional letters until Level 3.
3. **Level 3 — Syllable Split:** The word is visually broken into syllables with a stress marker (e.g., "be-cause" with stress on syllable 2 shown by bold or colour). The audio plays each syllable separately with a brief pause between them. The user must complete the full spelling.

**Constraints:**

- The ladder is never automatic. The user must click a calm button labelled "I need a hint" to progress through levels. There is no countdown or forced reveal.
- If the user completes the word at any ladder level, the attempt is recorded as "completed with hints" but does not count as a pure failure for FSRS scheduling. Only unassisted completions are treated as successes for mastery tracking.
- The ladder resets when the user moves to a new word. It does not persist across words.

---

### 5.4 Mistake Recording and FSRS Review Scheduling

**Mistake Definition:**

A mistake is recorded when a user completes a word with at least one incorrect keystroke (regardless of whether hints were used), or when the user abandons the session mid-word after 3 minutes of inactivity. Abandonment is treated as an incomplete attempt, not a full mistake, but the word is queued for review.

**FSRS Scheduling Design:**

The system implements a simplified FSRS (Free Spaced Repetition System) algorithm adapted for single-word spelling:

- Each word has a difficulty coefficient (`D`), initial interval (`I`), and stability (`S`).
- On first exposure: `I = 1` day, `D = 0.3`, `S = 1.0`.
- After a successful unassisted attempt: `D` decreases by `0.05` (minimum `0.1`); `I` increases by factor `2.5`; `S` increases by factor `2.0`.
- After a mistake (any incorrect letter, even with hints): `D` increases by `0.15` (maximum `0.9`); `I` resets to `1` day; `S` decreases by `0.5` (minimum `0.5`).
- The scheduling engine runs nightly (or on session start) to select the next review set, prioritising words with the shortest interval and highest difficulty.

**Review Queue Composition:**

A 20-minute daily session selects words in this approximate proportion:

- New words from current level: 50%
- FSRS review words (interval due today or overdue): 35%
- Recent mistakes (last 7 days): 15%

**Data Persistence:**

Attempt records are stored locally via a local-first strategy (see Architecture). If the user is offline, attempts accumulate in `IndexedDB`; upon reconnection, they sync to Supabase via the Drizzle ORM API. The FSRS engine uses the locally cached schedule and updates it after sync confirmation.

### 5.5 Levels and Unlock Rules

There are **8 levels**, structured as progressive bands of phonics, vocabulary, and complexity:

| Level | Theme / Focus | Example Patterns | Unlock Condition |
|---|---|---|---|
| 1 | Short Vowels & CVC Words | cat, dog, bed, sun | Default (immediate access) |
| 2 | Silent "e" and Long Vowels | name, time, ride, note | 80% accuracy on Level 1 over 3 sessions |
| 3 | Double Consonants | letter, happy, dinner, little | 80% accuracy on Level 2 over 3 sessions |
| 4 | Common Digraphs (sh, ch, th, wh, ph) | ship, chair, think, phone | 80% accuracy on Level 3 over 3 sessions |
| 5 | Blends (bl, br, cl, cr, dr, fl, fr, tr) | black, bring, cloud, train | 80% accuracy on Level 4 over 3 sessions |
| 6 | Syllable Patterns (2 syllables, stress) | happy, table, garden, mother | 80% accuracy on Level 5 over 3 sessions |
| 7 | Complex Patterns (silent letters, irregulars) | knife, write, answer, island | 80% accuracy on Level 6 over 3 sessions |
| 8 | Dictation & Phrases | Full sentences, common phrases | 75% accuracy on Level 7 over 3 sessions |

**Unlock Logic:**

- A level unlocks when the user achieves the required accuracy percentage over the specified number of sessions **with at least one session completed in the previous 48 hours**. This prevents binge-unlocking and ensures sustained engagement.
- A user may still practise unlocked levels at any time; unlocking is progressive, not restrictive.
- The dashboard displays a progress bar for the next unlock with a clear statement: "Complete 2 more sessions at 80% to unlock Level 3."

### 5.6 Dashboard Metrics

The dashboard updates at the end of every session. Metrics are computed from the user's `attempts` and `sessions` tables:

- **Session Duration:** Total minutes spent in active drill mode (excludes idle time > 3 minutes).
- **Words Completed:** Count of unique words completed (with or without hints) in the session.
- **Accuracy Rate:** `(unassisted completions / total attempts) * 100`. Rounded to the nearest integer.
- **Mistakes Today:** Count of words with at least one incorrect keystroke.
- **Streak (Consecutive Days):** Number of consecutive calendar days with at least one completed session. Breaks if a day passes with zero session start.
- **Level Progress:** Percentage of completed unique words at current level / total words at that level.
- **FSRS Review Load:** Number of words scheduled for review today.
- **Average Time Per Word:** `session_duration / words_completed`.

The dashboard uses calm, muted colours (`slate`, `stone`, `teal`) with no red error indicators. Mistakes are shown as a neutral count, not a failure metric.

---

## 6. Success Measures

### Quantitative (Measured via Database and Analytics)

- **Daily Active Sessions:** Target of 1 session per active user per day within the first 30 days of account creation.
- **Session Completion Rate:** At least 85% of started sessions reach the 15-minute minimum duration.
- **Accuracy Improvement:** Average user accuracy increases by at least 10 percentage points from their first session to their 20th session (measured as unassisted completions / total attempts).
- **FSRS Retention:** Words that have been in the FSRS cycle for 30 days show a mistake rate below 20% (indicating successful retention).
- **Level Progression Rate:** At least 60% of users who complete 10 sessions unlock Level 3; at least 30% unlock Level 5 within 60 days.

### Qualitative (Measured via Optional Feedback Form)

- User reports feeling "calm" or "not stressed" during practice (target: > 85% agreement).
- User reports the audio as "clear British English" (target: > 90% agreement).
- User reports the hint ladder as "helpful, not giving the answer away" (target: > 80% agreement).

---

## 7. Open Questions

1. **Audio Source:** Should we pre-render a complete `en-GB` slow-speed audio library (higher consistency, larger asset size), or rely entirely on `SpeechSynthesis` rate adjustment (lower asset overhead, potential voice inconsistency)?
2. **FSRS Library vs. Custom:** Should we import `ts-fsrs` or implement a custom FSRS scheduler tailored specifically to single-word spelling (lower dependency, more control over difficulty adjustments)?
3. **Microphone Assessment Depth:** Should the microphone hint provide only a binary "close / try again" comparison, or should it highlight which phoneme was mismatched? A deeper phoneme comparison requires a speech-to-text engine beyond basic `SpeechRecognition`.
4. **AdSense Placement:** Where exactly should ads appear (between drill words, in the dashboard sidebar, never within the session screen) to maintain the calm, non-commercial feel while meeting AdSense readiness requirements?
5. **Offline Sync Conflict:** If the user practices on two devices offline, which attempt record takes precedence during sync — the one with the most errors (higher difficulty) or the latest timestamp? The FSRS schedule depends on this decision.
6. **Accessibility:** Should we add ARIA live-region announcements for the red-letter validation and hint ladder, or does that risk overwhelming screen-reader users with frequent updates? How do we balance real-time feedback with accessibility calmness?

---

## 8. Appendix — British English Reference

All words, phonics rules, and pronunciation examples follow **Standard Southern British English (SSBE / Received Pronunciation)**. Audio sources must match this standard. Examples of key distinctions that the drill reinforces:

- Silent "e" lengthening: `name` (/neɪm/), `time` (/taɪm/)
- Double consonant: `letter` (/ˈletə/), `happy` (/ˈhæpi/)
- Digraphs: `think` (/θɪŋk/), `chair` (/tʃeə/), `ship` (/ʃɪp/)
- Silent letters: `knife` (/naɪf/), `island` (/ˈaɪlənd/)
- Syllable stress: `gar-den` (stress on 1), `ta-ble` (stress on 1)

No American variations (e.g., `color`, `center`, `schedule` with /ˈskedʒuːl/) are included in the word list.
