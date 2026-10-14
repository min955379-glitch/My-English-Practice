# Build Phases (PHASES.md)
# My English Practice

| Field | Value |
|---|---|
| Project | My English Practice |
| Version | 1.0.0 |
| Framework | Next.js 16 App Router + React 19 + TypeScript 5.9 |
| Database | PostgreSQL via Drizzle ORM |
| Deployment Target | Vercel (free tier) + Supabase (free tier) |
| Last Updated | 2026-01-15 |

---

## Overview of Phases

The build is divided into **5 phases**, mapping directly to the project's ROADMAP.md but expanded with working-level detail. Each phase includes: objective, exact deliverables, step-by-step task checkboxes, and a rigorous "Done When" acceptance criteria section.

---

## Phase 0 — Documentation, Environment Setup, and Design System

### Objective

Establish the technical foundation, design language, and documentation baseline before any feature code is written. Ensure the repository, database, and deployment pipeline are fully configured.

### Exact Deliverables

- Complete repository setup with `.env` templates for `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Drizzle ORM schema file (`src/db/schema.ts`) with all 8 levels' word tables, user profiles, attempts, review schedule, and sessions.
- Design system CSS variables and Tailwind v4 theme (`src/app/globals.css`) defining the calm colour palette (`slate`, `stone`, `teal`, `red-500` for errors only).
- Basic page skeletons (`/`, `/session`, `/dashboard`, `/phonics`) with no interactive logic but with correct navigation and layout components.
- Database seed script (`src/db/seed.ts`) that inserts all 8 levels of words, phonics patterns, syllable data, and example phrases.
- Health check API route (`/api/health`) confirming database connectivity.
- Documentation files updated: `README.md`, `ROADMAP.md`, `PRD.md`, `ARCHITECTURE.md`, and this `PHASES.md`.

### Step-by-Step Tasks (Checkboxes)

- [ ] Create `.env.example` with all required variables and explanatory comments.
- [ ] Configure `drizzle.config.json` with `schema` pointing to `./src/db/schema.ts` and `out` pointing to `./drizzle`.
- [ ] Install all required dependencies: `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `drizzle-orm`, `pg`, `dotenv`, plus development dependencies (`drizzle-kit`, `eslint`, `postcss`).
- [ ] Define colour palette in `src/app/globals.css` using Tailwind v4 `@theme` syntax: `--color-calm-teal: #0ea5e9`, `--color-calm-red: #ef4444`, `--color-calm-slate: #334155`, etc.
- [ ] Create the `Header` component with brand name "My English Practice", minimal navigation links (`Session`, `Phonics`, `Dashboard`), and a calm, spacious layout.
- [ ] Create the `Footer` component with accessibility statement and a note: "Designed for calm, private practice. No scores, no competition."
- [ ] Set up Supabase project (free tier) and create `auth.users` table (managed by Supabase) plus application tables via `npx drizzle-kit push`.
- [ ] Write `src/db/seed.ts` with at least 5 words per level (40 words total for MVP), including `text`, `level`, `patternCategory`, `syllableCount`, `syllableSplit`, and `stressPattern`.
- [ ] Verify `/api/health` returns `{"status":"ok","db":"connected"}` with HTTP 200.
- [ ] Confirm the repository builds (`npm run build`) with zero TypeScript errors.

### Done When — Acceptance Criteria

- [ ] `npm run build` completes with zero errors and zero warnings.
- [ ] `npx drizzle-kit push` applies the schema successfully to the PostgreSQL instance.
- [ ] The seed script runs (`npx tsx src/db/seed.ts`) and inserts 40+ rows into the `words` table without errors.
- [ ] `/api/health` responds with a 200 status and confirms database connectivity.
- [ ] The landing page (`/`) renders in a browser with correct typography, calm colour scheme, and responsive layout on mobile (375px width) and desktop (1440px width).
- [ ] All documentation files (`README.md`, `ROADMAP.md`, `PRD.md`, `ARCHITECTURE.md`, `PHASES.md`) are present and contain no placeholder text (`[TODO]`, `TBC`, `...`).

---

## Phase 1 — MVP Core Drill (Listen, Type, Red, Block, Complete)

### Objective

Build the complete core listen-and-spell drill: audio playback (normal and slow), letter-by-letter input with real-time red validation, blocking until correct, calm plain messages, and session tracking. This is the minimum viable product — everything else is an enhancement.

### Exact Deliverables

- `SessionPage` (`/session`) with the full drill interface.
- `DrillEngine` component that manages word flow, audio, input, and validation state.
- `LetterInput` component with hidden native input and visual letter spans.
- `AudioPlayer` component using `SpeechSynthesis` (`en-GB` voice) with replay functionality.
- `FeedbackBanner` component displaying calm plain messages (no animations, no alarm sounds).
- `HintLadder` component (basic version) visible after 2 failures, providing replay, first-letter reveal, and syllable split.
- `Attempt` recording logic that writes to `IndexedDB` locally (no server sync yet) with fields: `wordId`, `userId`, `sessionId`, `attemptNumber`, `errorsCount`, `hintsUsed`, `completed`, `timeSpentMs`, `result`.
- Basic session timer (visible in header) that starts on session entry and stops on exit.
- Navigation from `HomePage` to `SessionPage` and back.

### Step-by-Step Tasks (Checkboxes)

- [ ] Create `useAudio()` hook (`src/hooks/useAudio.ts`) that wraps `SpeechSynthesis`, selects `en-GB` voice, and provides `playNormal(text)`, `playSlow(text)`, and `stop()` functions.
- [ ] Create `useDrillEngine()` hook (`src/hooks/useDrillEngine.ts`) that manages the current word index, input state (`typedLetters: string[]`), error positions (`Set<number>`), current session ID, and word queue.
- [ ] Implement the `validateLetter()` function (`src/lib/validation.ts`) with case-insensitive comparison, red-state return, and block-advance logic.
- [ ] Build `LetterInput` component (`src/components/drill/LetterInput.tsx`) with the hidden input overlay approach described in `ARCHITECTURE.md`.
- [ ] Build `DrillCard` component (`src/components/drill/DrillCard.tsx`) that renders the `WordDisplay`, `LetterInput`, `FeedbackBanner`, and session progress indicator.
- [ ] Build `AudioPlayer` component with play buttons for normal and slow speed, and a replay button that calls `useAudio()` without creating new attempt records.
- [ ] Implement the blocking logic: if `errors.has(currentIndex)`, the input does not advance; the red letter remains visible; the user must backspace and retype or type the correct letter to replace it.
- [ ] Build `FeedbackBanner` with calm messages: "Not quite. Try that letter again." for incorrect input; "Good. Continue." for correct input (no message needed — calm design); "Word complete." at the end.
- [ ] Build basic `HintLadder` component: after 2 failures on the same word (`failuresOnCurrentWord >= 2`), show three progressive hint buttons (Replay with Emphasis, First Letter Reveal, Syllable Split). Each hint is delivered only on user click (no auto-reveal).
- [ ] Create the `SessionPage` layout: header with timer, main drill card, sidebar with session stats (words completed, current word index, session duration), and exit button.
- [ ] Implement session tracking: on session start, create a `session` record in `IndexedDB`; on session end (either user exit or time limit), update `durationMinutes`, `wordsCompleted`, and `levelReached`.
- [ ] Ensure the session works without a network connection: load word list from `IndexedDB`, play audio from `SpeechSynthesis`, and record attempts locally.
- [ ] Add basic keyboard accessibility: `Tab` focuses the input, `Enter` triggers replay, `Escape` exits session (with confirmation dialog).

### Done When — Acceptance Criteria

- [ ] The user can start a session, hear a word in normal British English (`en-GB`), and type it letter by letter.
- [ ] Typing an incorrect letter turns that letter red (`#ef4444`) with a calm plain message; the cursor/index does not advance.
- [ ] The user is blocked from completing the word until all letters are correct.
- [ ] The slow-speed replay works (either via `SpeechSynthesis` rate `0.65` or pre-rendered asset) and does not reveal any letters.
- [ ] After 2 failures on the same word, the hint ladder appears with clickable buttons; clicking reveals progressive support; no automatic reveal occurs.
- [ ] The session records every attempt locally (in `IndexedDB`) with all required fields (`wordId`, `userId`, `errorsCount`, `hintsUsed`, `completed`, `timeSpentMs`, `result`).
- [ ] The user can exit the session and return to the dashboard or home page; session duration is recorded.
- [ ] The core drill works offline: no network requests are required during the session after initial page load.
- [ ] All interactive elements are keyboard-accessible (`Tab`, `Enter`, `Escape`).
- [ ] The design is calm: no bright flashing animations, no alarm sounds, no red crosses or failure icons — only the red letter for incorrect input and calm text messages.

---

## Phase 2 — Phonics, Syllables, Patterns, and FSRS Review Scheduling

### Objective

Add structural understanding features (phonics, syllables, patterns) and implement the FSRS spaced repetition engine for review scheduling. Introduce the progress dashboard with real metrics.

### Exact Deliverables

- `PhonicsPage` (`/phonics`) with a grid of pattern categories, interactive examples, and practice drills.
- `SyllablesPage` (`/syllables`) with syllable split display, stress markers, and individual syllable replay.
- `DictationPage` (`/dictation`) with full-phrase listening and typing mode.
- `FSRS` scheduling logic (`src/lib/fsrs.ts`) with difficulty, stability, and interval adjustments.
- `useFSRS()` hook (`src/hooks/useFSRS.ts`) that updates the `review_schedule` table on attempt completion.
- `DashboardPage` (`/dashboard`) with metric cards (duration, accuracy, mistakes, streak), level progress rings, FSRS review load, and session history.
- `ProfilePage` (`/profile`) with user settings (daily target minutes, preferred voice) and auth management.
- `IndexedDB` sync mechanism for attempts (`/api/sync/attempts`) that writes to the PostgreSQL database.
- Server-side FSRS batch computation that updates `review_schedule` entries based on received attempts.

### Step-by-Step Tasks (Checkboxes)

**Phonics and Syllables:**

- [ ] Create `phonics_patterns` table in schema and seed with categories: `silent_e`, `double_consonant`, `digraph_sh`, `digraph_ch`, `digraph_th`, `digraph_wh`, `blend_bl`, `blend_tr`, `blend_fl`, `blend_fr`.
- [ ] Build `PhonicsGrid` component displaying each category with a brief description and 3 example words.
- [ ] Create `PhonicsDrill` component (embedded in `PhonicsPage`) that selects a word from the category and runs the same letter-by-letter validation as the core drill.
- [ ] Build `SyllableDisplay` component that renders `syllableSplit` with stress markers (bold or colour for stressed syllable).
- [ ] Add syllable-level replay: when the user clicks a syllable, the `AudioPlayer` plays only that syllable (using `SpeechSynthesis` with the word split at the syllable boundary).
- [ ] Create `DictationPage` that selects phrases (e.g., "thank you very much", "how are you today") from the `words` table where `syllableCount > 1`, plays the full phrase at normal speed, and validates the full string letter by letter.

**FSRS Scheduling:**

- [ ] Implement `fsrsUpdate()` function (`src/lib/fsrs.ts`) that takes `currentD`, `currentS`, `currentI`, `success: boolean`, `errorsCount: number`, and `hintsUsed: number`, then computes new values.
- [ ] Define adjustment rules precisely: `success` means `completed === true` and `errorsCount === 0` and `hintsUsed === 0`. Any other outcome (errors > 0 or hints > 0) is treated as a partial success with reduced stability gain.
- [ ] Build `useFSRS()` hook that reads the current `review_schedule` entry for a word, applies the update, writes back to `IndexedDB`, and queues for sync.
- [ ] Create the `selectSessionWords()` algorithm that mixes new words (50%), FSRS due reviews (35%), and recent mistakes (15%) based on the `review_schedule` table.
- [ ] Add `FSRSReviewList` component to the dashboard showing words scheduled for review today, sorted by urgency (`intervalDays` ascending).

**Dashboard:**

- [ ] Create `MetricCard` component showing: Session Duration (minutes), Words Completed (count), Accuracy Rate (%), Mistakes Today (count), Streak (days), Level Progress (%), FSRS Review Load (count), Average Time Per Word (seconds).
- [ ] Build `LevelProgressRing` using native SVG (`<circle>` with `stroke-dasharray`) to show mastery percentage per unlocked level.
- [ ] Build `SessionHistoryChart` showing session duration over the last 14 days as a simple bar chart.
- [ ] Implement the session history query that reads from the `sessions` table (synced) or `IndexedDB` (local).

**Sync and Server Side:**

- [ ] Create `/api/sync/attempts` endpoint that accepts a JSON array of attempt objects, validates the JWT, inserts each row into `attempts` using Drizzle ORM with `user_id = auth.uid()` check, and returns `{synced: number}`.
- [ ] Create server-side FSRS update endpoint (`/api/fsrs/update`) or compute updates directly within the sync endpoint: for each attempt, read the current `review_schedule` row, apply `fsrsUpdate()`, and write back.
- [ ] Add `SyncStatus` indicator in the header (visible when `navigator.onLine` changes or after sync completes).

**Profile and Auth:**

- [ ] Integrate Supabase Auth (`@supabase/supabase-js`) with email/password sign-up and sign-in.
- [ ] Build `ProfilePage` with a form to update `displayName`, `preferredVoice`, and `dailyTargetMinutes` (stored in `profiles` table).
- [ ] Add a calm sign-out button that clears the session and redirects to `/`.

### Done When — Acceptance Criteria

- [ ] The user can navigate to `/phonics` and see interactive phonics patterns with example words; clicking a word runs a mini-drill with the same validation rules.
- [ ] The user can navigate to `/syllables` and see syllable splits with stress markers; clicking a syllable plays only that syllable.
- [ ] The user can navigate to `/dictation` and practise typing full phrases with letter-level validation.
- [ ] After a session with mistakes, the `FSRSReviewList` on `/dashboard` shows the misspelled words scheduled for review with a due date.
- [ ] The `DashboardPage` displays accurate metrics computed from the `attempts` and `sessions` tables (either from `IndexedDB` or after sync).
- [ ] The `/api/sync/attempts` endpoint receives attempts from the client, inserts them into PostgreSQL, and updates `review_schedule` without errors.
- [ ] The user can sign up, sign in, update their profile settings, and sign out; the profile settings persist across sessions.
- [ ] The session selection algorithm (`selectSessionWords`) returns a mix of new, review, and mistake words that matches the target proportions.
- [ ] All new pages (`phonics`, `syllables`, `dictation`, `dashboard`, `profile`) are responsive and maintain the calm design language.

---

## Phase 3 — Pronunciation, Fluency, Dictation, and Microphone Integration

### Objective

Strengthen oral fluency with the microphone speak-and-check feature, expand dictation to full phrases, add pronunciation hints, and refine the audio experience. This phase enhances the product without changing the core validation model.

### Exact Deliverables

- `MicrophoneCheck` component integrated into the `DrillCard` as an optional, supportive hint (never a gate).
- Enhanced `AudioPlayer` with syllable-level playback and improved `SpeechSynthesis` voice selection.
- Expanded `DictationPage` with multi-phrase sessions (3 phrases per session) and phrase-level progress tracking.
- `PronunciationHint` component that uses the `SpeechRecognition` result to display a calm comparison message.
- Improved error messages in the `FeedbackBanner` that reference phoneme patterns when relevant (e.g., if the user types "nit" for "night", the message mentions the silent "gh").
- Voice preference persistence in `profiles` and application on every `AudioPlayer` load.
- Performance optimisation: lazy loading of `SpeechRecognition` and audio assets; code splitting for `/phonics`, `/syllables`, and `/dictation` pages.

### Step-by-Step Tasks (Checkboxes)

**Microphone Integration:**

- [ ] Build `useMicrophone()` hook (`src/hooks/useMicrophone.ts`) that wraps `SpeechRecognition`, sets `lang = "en-GB"`, handles `onstart`, `onresult`, `onerror`, and `onend` events.
- [ ] Implement `stringSimilarity()` (`src/lib/similarity.ts`) using Levenshtein distance for single-word comparison.
- [ ] Build `MicrophoneCheck` component (`src/components/drill/MicrophoneCheck.tsx`) with a calm microphone button. On click, start recognition, display a listening indicator (calm, not alarming — e.g., a subtle pulsing circle), and show the result message.
- [ ] Ensure the microphone feature is never a gate: the user can complete the word regardless of the microphone result. The microphone button is disabled or hidden if `SpeechRecognition` is unavailable.
- [ ] Add a privacy banner on first microphone use: "Your microphone is used only for this practice hint. No audio is sent to a server." The user must click "Continue" to proceed.

**Audio Enhancements:**

- [ ] Refine `useAudio()` to prefer the user's saved `preferredVoice` from the `profiles` table; if not set, fall back to the best `en-GB` voice.
- [ ] Implement syllable-level playback in `AudioPlayer`: when the user clicks a syllable segment (from `syllableSplit`), construct a new `SpeechSynthesisUtterance` with the syllable text and play it.
- [ ] Add a "Voice Test" section on `/profile` where the user can play a test phrase ("The rain in Spain stays mainly in the plain") in their preferred voice before saving the preference.

**Dictation Expansion:**

- [ ] Expand the `words` seed data with at least 20 phrases (e.g., "good morning", "thank you very much", "how are you today", "please could you help me"). These are stored with a `phrase` flag or in a separate `phrases` table.
- [ ] Update `DictationPage` to select 3 phrases per session, play each phrase at normal speed, and require full phrase typing with letter-level validation (same red-letter behaviour).
- [ ] Add phrase-level progress tracking: a `dictation_attempts` table or reuse `attempts` with `phraseId` and `isPhrase` flags.

**Pronunciation Hints:**

- [ ] Enhance `FeedbackBanner` messages to include phoneme hints for common error patterns. For example:
  - User types `"helo"` for `"hello"` → message: "Not quite. Remember the double 'l' sound."
  - User types `"nit"` for `"night"` → message: "Not quite. The 'gh' is silent. Try again."
- [ ] These hints are triggered only when the `patternCategory` of the word matches a known error pattern; they are never generated for arbitrary words.

**Performance and Accessibility:**

- [ ] Add dynamic imports (`next/dynamic`) for `/phonics`, `/syllables`, `/dictation` pages to reduce initial bundle size.
- [ ] Implement ARIA live regions (`aria-live="polite"`) for the `FeedbackBanner` so screen readers announce the calm message without interrupting the user.
- [ ] Ensure the microphone listening indicator has an `aria-label` describing the listening state.

### Done When — Acceptance Criteria

- [ ] The user can click the microphone button on any word; the browser requests microphone permission; upon permission, the user can speak the word and see a calm comparison result.
- [ ] The microphone feature does not block word completion; the user can finish the word by typing regardless of the microphone result.
- [ ] If `SpeechRecognition` is unavailable, the microphone button is hidden or disabled with a non-judgemental tooltip.
- [ ] The user can play individual syllables by clicking syllable segments; audio plays clearly with `en-GB` pronunciation.
- [ ] The `DictationPage` supports 3-phrase sessions with full phrase typing and letter-level validation.
- [ ] The `FeedbackBanner` provides enhanced messages that reference phoneme patterns for common mistakes.
- [ ] The `ProfilePage` includes a "Voice Test" section; the selected voice is saved and applied to all future audio playback.
- [ ] Dynamic imports reduce the initial bundle size for pages that are not immediately needed.
- [ ] ARIA live regions announce feedback messages to screen readers.

---

## Phase 4 — Polish, Performance, Deployment, and AdSense Readiness

### Objective

Finalise the product with production-grade polish: performance optimisation, deployment configuration, AdSense readiness, final accessibility audit, and documentation updates. Ensure the site passes all validation steps (`next typegen`, `tsc --noEmit`, `npm run build`) and bootstraps correctly via `build_and_start`.

### Exact Deliverables

- Production deployment configuration (`next.config.ts` with `images`, `headers`, `rewrites` for AdSense compatibility).
- AdSense-ready structure: clearly defined content areas, no overlay ads, responsive ad slots in the dashboard sidebar and between session pages.
- Final accessibility audit: colour contrast ratios (`WCAG AA` minimum for all text), keyboard navigation, screen reader compatibility, focus indicators.
- Performance audit: Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1) measured via Lighthouse.
- Security audit: RLS policies verified, service role key not exposed, environment variables validated.
- Final build and deployment: `npm run build` passes; `build_and_start` verifies `/api/health` and database bootstrap.
- Updated `README.md` with installation instructions, deployment link, and feature summary.
- Updated `ROADMAP.md` with completed phase checkmarks.

### Step-by-Step Tasks (Checkboxes)

**Deployment and Configuration:**

- [ ] Configure `next.config.ts` with `output: "standalone"` for efficient Vercel deployment (optional but recommended for free tier performance).
- [ ] Set `images.remotePatterns` in `next.config.ts` for any external images (e.g., Supabase storage, external audio assets).
- [ ] Configure `headers` in `next.config.ts` for security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy` allowing `self`, `blob:`, and `https://fonts.googleapis.com` for any external font usage).
- [ ] Ensure `.env` variables are loaded correctly in the Vercel dashboard (not committed to `.git`).
- [ ] Verify `DATABASE_URL` connects to the Supabase PostgreSQL instance; test with a fresh database instance if needed.

**AdSense Readiness:**

- [ ] Identify ad placement zones: a sidebar widget area in `/dashboard` and a banner area below the session results screen (not within the drill input area).
- [ ] Ensure no ads appear during the core drill session (to maintain calm, non-commercial focus during practice). Ads are only shown on `/dashboard`, `/phonics` (bottom of page), and `/` (below the hero section).
- [ ] Confirm all content is original (no copied text from other language-learning sites) to comply with AdSense programme policies.
- [ ] Add `ads.txt` placeholder file in `/public/` with a comment explaining it will be updated upon AdSense approval.
- [ ] Ensure the site has a privacy policy page (`/privacy`) and terms of service (`/terms`) — basic, calm, text-only pages — to meet AdSense requirements.

**Accessibility Audit:**

- [ ] Run Lighthouse audit on `/`, `/session`, `/dashboard`, and `/phonics` pages. Target: Performance >= 85, Accessibility >= 95, Best Practices >= 95.
- [ ] Verify colour contrast ratios: all text on all backgrounds must meet `WCAG AA` (minimum 4.5:1 for normal text, 3:1 for large text). The calm palette (`slate-950` on `slate-50`, `red-500` on `slate-950`) must be verified.
- [ ] Verify keyboard navigation: every interactive element (`button`, `input`, `link`) must be reachable via `Tab` and operable via `Enter` or `Space`. The `LetterInput` hidden input must maintain focus correctly.
- [ ] Verify focus indicators: all focused elements must have a visible `outline` or `box-shadow` (not removed by `outline-none` without replacement).
- [ ] Verify screen reader compatibility: the `FeedbackBanner` must have `aria-live="polite"`; the `WordDisplay` must describe the current word and its syllable split; the `SessionTimer` must be readable by assistive technology.

**Performance Audit:**

- [ ] Measure `LCP` (Largest Contentful Paint) on `/` and `/session`. Target: < 2.5 seconds. If over, investigate image sizes, font loading, and server response times.
- [ ] Measure `FID` (First Input Delay) or `INP` (Interaction to Next Paint) on `/session`. Target: < 100ms. If over, investigate main-thread blocking (reduce `SpeechSynthesis` blocking, optimise event handlers).
- [ ] Measure `CLS` (Cumulative Layout Shift) on `/dashboard`. Target: < 0.1. Ensure metric cards and progress rings have fixed dimensions or `min-height` to prevent layout shifts during data loading.
- [ ] Confirm `bundle` size: the client-side JavaScript bundle should be under 300KB (gzipped) for the initial load. If larger, investigate code splitting (`next/dynamic`) and dependency tree pruning.

**Security Audit:**

- [ ] Verify all `user_id` fields in the `profiles`, `attempts`, `review_schedule`, and `sessions` tables are protected by RLS policies.
- [ ] Verify the `SUPABASE_SERVICE_ROLE_KEY` is not present in any client-side code (`grep -r "SERVICE_ROLE" src/` should only match server-side files).
- [ ] Verify all API routes (`/api/auth`, `/api/session`, `/api/attempt`, `/api/sync`) validate the JWT and reject unauthenticated requests with a 401 status.
- [ ] Confirm `.env` contains no hardcoded secrets. All secrets are loaded from environment variables.

**Documentation and Final Validation:**

- [ ] Run `bash -lc 'npx next typegen 2>&1 | tee /tmp/next-typegen.log'` and confirm success (exit code 0).
- [ ] Run `bash -lc 'npm exec tsc -- --noEmit --pretty false 2>&1 | tee /tmp/tsc.log'` and confirm zero errors.
- [ ] Run `bash -lc 'npm run build 2>&1 | tee /tmp/build.log'` and confirm zero errors and zero warnings.
- [ ] After successful build, run `build_and_start` to verify the production server bootstraps, connects to the database, and responds with 200 on `/api/health`.
- [ ] Update `README.md` with a brief description, feature list (core drill, phonics, syllables, dictation, microphone, FSRS, dashboard), tech stack, and a link to the deployed site (once deployed).
- [ ] Update `ROADMAP.md` by adding checkmarks (`[x]`) to all completed phase items (Phase 0 through Phase 4).
- [ ] Confirm `PRD.md`, `ARCHITECTURE.md`, and `PHASES.md` (this file) are complete, consistent with the `README.md` and `ROADMAP.md`, and contain no placeholder text.

### Done When — Acceptance Criteria

- [ ] `npm run build` completes with zero TypeScript errors and zero build warnings.
- [ ] `build_and_start` succeeds: the server starts, the database is bootstrapped (`npx drizzle-kit push` or equivalent), and `/api/health` returns a 200 status.
- [ ] The Lighthouse audit on `/` and `/session` scores >= 85 in Performance, >= 95 in Accessibility, and >= 95 in Best Practices.
- [ ] The site is deployed to Vercel (free tier) with a working URL; the deployment does not require manual environment variable entry beyond what the Vercel dashboard supports.
- [ ] AdSense readiness is confirmed: no overlay ads during the drill, clearly separated content and ad areas, privacy policy and terms pages exist, original content is verified, `ads.txt` placeholder is present.
- [ ] All documentation files (`README.md`, `ROADMAP.md`, `PRD.md`, `ARCHITECTURE.md`, `PHASES.md`) are present, fully written, and consistent with each other.
- [ ] The site functions correctly for a new user from sign-up through a full session (listen, type, complete, see dashboard metrics, see FSRS reviews scheduled).
- [ ] The user can practise for 15–25 minutes continuously with no network interruptions; all data syncs correctly when connectivity returns.
- [ ] The site maintains a calm, adult-appropriate design throughout: no bright flashing colours (except the red error letter), no alarm sounds, no competitive elements.

---

## Cross-Phase Dependencies and Risk Mitigation

### Dependency Chain

Phase 0 (Setup) → Phase 1 (MVP Core Drill) — depends on Phase 0 database and design system → Phase 2 (Phonics + FSRS + Dashboard) — depends on Phase 1 attempt recording and session tracking → Phase 3 (Microphone + Dictation + Pronunciation) — depends on Phase 1 audio and Phase 2 FSRS → Phase 4 (Polish + Deployment + AdSense) — depends on all previous phases

### Key Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| `SpeechSynthesis` unavailable on user device | Core audio feature fails | Fallback message; word list still usable; pre-rendered assets as backup |
| Database schema changes after data seeding | Data loss or sync errors | Use `drizzle-kit migrate` for schema evolution; never `push` destructively after seeding |
| FSRS scheduling produces too many review words | Session exceeds 25 minutes | Cap the review pool at 9 words per session; overflow rolls to next day |
| Microphone permission denied by user | Feature unavailable | Feature is optional; the user continues with spelling-only drill |
| Free hosting (Vercel) hits bandwidth limits | Site unavailable | Monitor Vercel analytics; if bandwidth exceeded, reduce audio asset usage |
| AdSense approval rejected | No monetisation | Continue operating as a free product; monetisation is optional |

---

## Timeline Estimate (Working Days)

| Phase | Duration | Key Milestones |
|---|---|---|
| Phase 0 | 3 days | Setup, schema, seed, docs complete |
| Phase 1 | 7 days | Core drill fully functional, offline-capable |
| Phase 2 | 8 days | Phonics, syllables, FSRS, dashboard, sync |
| Phase 3 | 6 days | Microphone, dictation expansion, performance |
| Phase 4 | 4 days | Accessibility, deployment, final validation |
| **Total** | **28 working days** | Full product ready for public use |

*This document is the working build plan for My English Practice. Every checkbox represents a real task; every "Done When" is a verifiable acceptance criterion.*
