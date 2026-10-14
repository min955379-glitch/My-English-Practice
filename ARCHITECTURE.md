# Architecture Document (ARCHITECTURE.md)
# My English Practice

| Field | Value |
|---|---|
| Project | My English Practice |
| Version | 1.0.0 |
| Runtime | Next.js 16 App Router (React 19, TypeScript 5.9) |
| Database | PostgreSQL via Drizzle ORM |
| Auth / Data | Supabase (PostgREST + Auth) |
| Speech | Browser SpeechSynthesis (`en-GB`) + Web Speech API |
| Style | Tailwind CSS v4 |
| State / Cache | React Context + IndexedDB (local-first) |

---

## 1. System Overview

My English Practice is a **local-first web application** with a cloud-sync layer. The user interacts primarily with a React frontend running in the browser. The core drill, phonics, syllables, patterns, dictation, and microphone features all function without a network connection once the initial assets and word list are cached. User progress, attempt records, and FSRS schedules are stored locally in `IndexedDB` and synchronised to a PostgreSQL database (hosted via Supabase) when connectivity is available.

The architecture follows a **layered, modular design** with clear separation between presentation (UI components), business logic (custom hooks and service modules), data access (Drizzle ORM and Supabase clients), and infrastructure (PostgreSQL, auth, speech APIs).

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Client (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │    Pages     │  │  Components  │  │   Service Hooks     │ │
│  │  /session    │  │  DrillCard   │  │  useDrillEngine()   │ │
│  │  /dashboard  │  │  PhonicsGrid │  │  useFSRS()          │ │
│  │  /phonics    │  │  ProgressBar │  │  useAudio()         │ │
│  └──────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              React Context (App State)                  │ │
│  │  AuthContext │ DrillContext │ FSRSContext │ SyncContext │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Local-First Storage (IndexedDB)            │ │
│  │  attempts │ sessions │ review_schedule │ user_profile   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
▼ (sync when online)
┌─────────────────────────────────────────────────────────────┐
│              Supabase / PostgreSQL (Cloud)                  │
│  auth.users │ profiles │ words │ attempts │ review_schedule │
│  lessons    │ patterns  │ phonics │ syllables │ sessions     │
└─────────────────────────────────────────────────────────────┘
│
▼
Browser SpeechSynthesis / Web Speech API
(en-GB voice, rate-adjustable, microphone input)
```

---

## 2. Frontend Structure

### 2.1 Page Routes (Next.js App Router)

| Route | Component | Purpose |
|---|---|---|
| `/` | `HomePage` | Landing page with product explanation, start session button, and level preview. |
| `/session` | `SessionPage` | Main drill interface. Contains the active word card, input field, hint ladder, audio controls, session timer, and exit/navigation buttons. |
| `/dashboard` | `DashboardPage` | Post-session and standalone progress view with metrics cards, level progress bars, FSRS review load, and session history table. |
| `/phonics` | `PhonicsPage` | Grid of phonics patterns (silent "e", double consonants, digraphs, blends) with interactive examples. |
| `/syllables` | `SyllablesPage` | Syllable breakdown tool: user selects a word, sees syllable split with stress markers, and can replay syllables individually. |
| `/dictation` | `DictationPage` | Full-phrase mode: audio plays a phrase; user types the complete phrase; letter-level validation applies to the entire string. |
| `/profile` | `ProfilePage` | User settings, auth management, voice preference, and sync status indicator. |

### 2.2 Component Hierarchy (Key Components)

```
AppLayout
├── Header (brand, session timer mini, sync status)
├── MainContent
│   ├── DrillEngine (orchestrates word flow, audio, input, validation)
│   │   ├── AudioPlayer (normal / slow / syllable replay)
│   │   ├── LetterInput (character validation, red-state rendering)
│   │   ├── HintLadder (progressive reveal buttons)
│   │   ├── WordDisplay (target word, syllable split, stress markers)
│   │   └── FeedbackBanner (calm plain messages)
│   ├── SessionControls (start, pause, finish, exit to dashboard)
│   └── ProgressSidebar (session stats, current word index, streak)
└── Footer (calm links, accessibility statement)
```

**DrillEngine Component Details:**

- Receives the current `DrillState` from `useDrillEngine()` hook.
- Renders `AudioPlayer` with `normal` and `slow` playback controls.
- Manages the `LetterInput` component, which binds to a `useRef`-managed input element to prevent React re-render overhead on every keystroke.
- Calls the validation function synchronously (`validateLetter(index, char)`) for instant feedback.
- Triggers the `HintLadder` visibility when `failuresOnCurrentWord >= 2`.
- On word completion (`currentIndex === word.length - 1` and last letter correct), calls `recordAttempt()` and triggers the FSRS update.

**Dashboard Components:**

- `MetricCard` — displays a single metric (duration, accuracy, mistakes) with a calm colour-coded trend arrow.
- `LevelProgressRing` — circular progress bar showing percentage of words completed at each unlocked level.
- `FSRSReviewList` — table of words scheduled for review today, sorted by interval urgency.
- `SessionHistoryChart` — simple bar chart of session duration over the last 14 days (using native SVG, no chart library dependency to keep bundle small).

---

## 3. Data Model (PostgreSQL + Drizzle ORM)

### 3.1 Schema Tables

All tables include `created_at`, `updated_at`, and `user_id` (foreign key to `auth.users`) fields. Row-level security is enforced on every table with user-specific policies.

```typescript
// users / profiles
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => authUsers.id),
  displayName: varchar("display_name", { length: 100 }),
  preferredVoice: varchar("preferred_voice", { length: 50 }).default("en-GB Microsoft Hazel"),
  dailyTargetMinutes: integer("daily_target_minutes").default(20),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// words (curated vocabulary and patterns)
export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  text: varchar("text", { length: 50 }).notNull(),
  level: integer("level").notNull(), // 1–8
  patternCategory: varchar("pattern_category", { length: 50 }), // e.g., "silent_e", "double_consonant"
  syllableCount: integer("syllable_count").notNull(),
  syllableSplit: varchar("syllable_split", { length: 100 }), // e.g., "ta-ble"
  stressPattern: varchar("stress_pattern", { length: 20 }), // e.g., "1-0"
  audioUrl: varchar("audio_url", { length: 255 }), // optional slow-prerendered asset
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// attempts (every interaction in the drill)
export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => authUsers.id),
  wordId: integer("word_id").notNull().references(() => words.id),
  sessionId: uuid("session_id").notNull().references(() => sessions.id),
  attemptNumber: integer("attempt_number").notNull(), // 1, 2, 3...
  errorsCount: integer("errors_count").notNull(),
  hintsUsed: integer("hints_used").notNull(), // 0–3
  completed: boolean("completed").notNull(),
  timeSpentMs: integer("time_spent_ms").notNull(),
  result: varchar("result", { length: 20 }).notNull(), // "success", "mistake", "abandoned"
  createdAt: timestamp("created_at").defaultNow(),
});

// review_schedule (FSRS scheduling)
export const reviewSchedule = pgTable("review_schedule", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => authUsers.id),
  wordId: integer("word_id").notNull().references(() => words.id),
  intervalDays: integer("interval_days").notNull(),
  difficulty: real("difficulty").notNull(), // 0.1 – 0.9
  stability: real("stability").notNull(), // 0.5 – 5.0
  dueDate: timestamp("due_date").notNull(),
  lastReviewedAt: timestamp("last_reviewed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// sessions (daily session aggregates)
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => authUsers.id),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  durationMinutes: integer("duration_minutes"),
  wordsCompleted: integer("words_completed"),
  accuracyPercent: real("accuracy_percent"),
  levelReached: integer("level_reached"),
  createdAt: timestamp("created_at").defaultNow(),
});

// phonics / syllables / dictation (optional reference)
export const phonicsPatterns = pgTable("phonics_patterns", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  exampleWords: text("example_words"), // JSON array as text
  orderIndex: integer("order_index").notNull(),
});
```

### 3.2 Relationships

- `profiles.user_id` → `auth.users.id` (1:1)
- `attempts.user_id` → `auth.users.id` (many:1)
- `attempts.word_id` → `words.id` (many:1)
- `attempts.session_id` → `sessions.id` (many:1)
- `review_schedule.user_id` → `auth.users.id` (many:1)
- `review_schedule.word_id` → `words.id` (many:1)
- `sessions.user_id` → `auth.users.id` (many:1)

---

## 4. Spelling Validation — Letter-by-Letter

### 4.1 Validation Logic

The validation is performed synchronously in the browser for instant feedback. No server call is made per keystroke.

```typescript
function validateLetter(
  targetWord: string,
  currentIndex: number,
  typedChar: string
): ValidationResult {
  const targetChar = targetWord[currentIndex];
  const isCorrect = typedChar.toLowerCase() === targetChar.toLowerCase();
  if (!isCorrect) {
    return {
      valid: false,
      state: "red",
      message: "Not quite. Try that letter again.",
      blockAdvance: true,
      index: currentIndex, // stay here
    };
  }
  return {
    valid: true,
    state: "neutral",
    message: null,
    blockAdvance: false,
    index: currentIndex + 1,
  };
}
```

**Key Behaviours:**

- Case-insensitive comparison (`toLowerCase()`) to avoid punishing capitalisation errors in a spelling-focused drill.
- The cursor/index never advances past an uncorrected letter.
- If the user types the wrong letter, it is rendered in red (`#ef4444`) at the same index position, and the correct letter does not appear (no auto-correct or reveal).
- Backspace (`Backspace` key) moves the index back by 1, removing the letter at the previous index and allowing re-entry.
- If the user pastes a string (`Paste` event), the event is prevented (`e.preventDefault()`); only single-character input is accepted.

### 4.2 Red-Letter Rendering

The input component uses a hidden `<input type="text">` (for native keyboard support and accessibility) overlaid with a visual representation of the word. Each character in the visual representation is a `<span>` with conditional classes:

```tsx
<span
  key={i}
  className={
    i === currentIndex
      ? "text-slate-950 border-b-2 border-teal-500"
      : errors.has(i)
      ? "text-red-500 font-medium"
      : "text-slate-700"
  }
>
  {i < inputLength ? typedLetters[i] : "_"}
</span>
```

The hidden input captures keystrokes; the visual spans reflect the validated state. This approach avoids re-rendering the input element on every keystroke and maintains focus correctly for screen readers.

---

## 5. Normal / Slow Audio Implementation

### 5.1 Audio Source Strategy

The application uses a **hybrid audio strategy** for reliability and consistency:

1. **Primary:** Browser `SpeechSynthesis` API (`window.speechSynthesis`) with `lang = "en-GB"`, selecting the highest-priority British English voice available on the device.
2. **Secondary:** Pre-rendered `.mp3` or `.ogg` audio files hosted in `/public/audio/` (e.g., `/public/audio/word_1_normal.mp3`, `word_1_slow.mp3`). These are used as a fallback when `SpeechSynthesis` is unavailable or when the user explicitly selects a "high quality" audio mode.

### 5.2 Normal Speed Playback

```typescript
function playNormal(wordId: number, text: string) {
  if (!window.speechSynthesis) {
    showAudioUnavailableBanner();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  // Select a British English voice if available
  const voices = window.speechSynthesis.getVoices();
  const gbVoice = voices.find(
    (v) => v.lang === "en-GB" || v.lang.startsWith("en-GB")
  ) || voices.find((v) => v.lang.startsWith("en"));
  if (gbVoice) utterance.voice = gbVoice;
  window.speechSynthesis.cancel(); // Stop any previous playback
  window.speechSynthesis.speak(utterance);
}
```

**Notes:**

- `speechSynthesis.getVoices()` is asynchronous on some browsers (`voiceschanged` event). The `useAudio()` hook caches the voice list after first load.
- `speechSynthesis.cancel()` is called before each new utterance to prevent overlapping playback.
- The replay button does not trigger a new `attempt` record; it only calls `playNormal()` or `playSlow()`.

### 5.3 Slow Speed Playback

Two options are implemented, with `SpeechSynthesis` rate adjustment as the default (lower asset overhead) and pre-rendered slow files as the preferred high-consistency option where assets exist:

**Option A: Rate Adjustment (Default)**

```typescript
utterance.rate = 0.65; // 65% of normal speed
```

**Option B: Pre-rendered Asset (Preferred for Key Levels)**

The `audioUrl` field in the `words` table points to the slow file. If present, the `AudioPlayer` uses an HTML5 `<audio>` element rather than `SpeechSynthesis`.

**Behaviour:**

- Slow playback is available from the start of any word (no fail requirement), but is particularly encouraged after the first incorrect attempt.
- Slow audio does not reveal any letters. It is a pure auditory support.

---

## 6. Microphone Checking — Speak and Check

### 6.1 Purpose and Limits

The microphone feature is a **supportive hint**, not an assessment gate. Its purpose is to help the user build oral confidence by comparing their spoken attempt to the target word. It does **not** block progression, does **not** replace the spelling validation, and does **not** generate grades.

### 6.2 Implementation

The feature uses the **Web Speech API (`SpeechRecognition`)** where supported (`Chrome`, `Edge`, `Safari` with permission). It is entirely optional — a user can complete all 8 levels without ever using a microphone.

```typescript
function startMicrophoneCheck(targetWord: string) {
  if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
    showMicrophoneUnsupportedMessage();
    return;
  }
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-GB";
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    const similarity = stringSimilarity(transcript, targetWord.toLowerCase());
    // Display a calm, supportive comparison — never a failure message
    if (similarity > 0.85) {
      setMicFeedback({ type: "close", message: "That sounds very close to the word!" });
    } else if (similarity > 0.5) {
      setMicFeedback({ type: "partial", message: "You have the right sound idea. Try spelling it again." });
    } else {
      setMicFeedback({ type: "hint", message: "Remember the first sound is /k/ for 'cat'. Try once more." });
    }
  };
  recognition.onerror = () => {
    setMicFeedback({ type: "neutral", message: "Could not hear clearly. That's okay — you don't need the microphone to finish." });
  };
  recognition.start();
}
```

**String Similarity Function:**

A simple Levenshtein distance calculation compares the recognised transcript to the target word. No external library is required for single-word comparison.

### 6.3 Limits and Edge Cases

- **Accuracy:** Browser speech recognition is not precise enough for phoneme-level comparison. The similarity threshold (`0.85`) is intentionally forgiving. The feature is designed to encourage, not to diagnose.
- **Privacy:** Microphone access requires explicit user permission (`getUserMedia`). The permission prompt appears only when the user clicks the microphone button. Audio is processed locally by the browser; no audio data is sent to the server.
- **Unsupported Browsers:** If `SpeechRecognition` is unavailable, the microphone button is hidden or disabled with a tooltip: "Microphone check not available in this browser. Continue spelling — it's just as effective."
- **No Block:** Even if the microphone reports low similarity, the user can proceed with spelling without any restriction.

---

## 7. FSRS Scheduling Design

### 7.1 Algorithm Overview

The application uses a **simplified FSRS algorithm** specifically tuned for single-word spelling retention. Rather than importing a general-purpose FSRS library, the custom implementation allows precise control over difficulty adjustments based on spelling errors (not just binary correct/incorrect).

**Parameters per Word-User Pair:**

| Parameter | Symbol | Initial Value | Min / Max | Adjustment Rules |
|---|---|---|---|---|
| Difficulty | `D` | `0.3` | `0.1` / `0.9` | Decrease by `0.05` on unassisted success; increase by `0.15` on any error. |
| Stability | `S` | `1.0` | `0.5` / `10.0` | Multiply by `2.0` on unassisted success; multiply by `0.5` on error. |
| Interval | `I` | `1` day | `0.5` / `365` | Reset to `1` on error; multiply by `2.5` on success. |
| Due Date | `due` | `now + I` | — | Computed from `lastReviewedAt + I` days. |

### 7.2 Scheduling Engine

The scheduling engine runs in two contexts:

1. **On Attempt Completion (Client-Side, then Sync):**
   - When the user completes a word, the `useFSRS()` hook updates the local `IndexedDB` record immediately.
   - The new `interval`, `difficulty`, `stability`, and `dueDate` are computed using the rules above.
   - The updated record is queued in a sync batch.
2. **Nightly / Session-Start Batch (Server-Side):**
   - When the user starts a new session, the server (or local cached copy) selects words for the session:
   - Words where `dueDate <= today` (review load).
   - Words from the current unlocked level (new words).
   - Words with `lastReviewedAt` within the last 7 days but `errorsCount > 0` (recent mistakes).

### 7.3 Review Queue Selection

For a standard 20-minute session, the selection algorithm picks approximately 25 words:

```typescript
function selectSessionWords(userId: string, currentLevel: number): Word[] {
  const reviewPool = getDueWords(userId); // dueDate <= today
  const newPool = getLevelWords(currentLevel);
  const mistakePool = getRecentMistakes(userId, days = 7);
  const mix = [
    ...reviewPool.slice(0, 9),   // ~35% reviews
    ...mistakePool.slice(0, 4),  // ~15% mistakes
    ...newPool.slice(0, 12),     // ~50% new words
  ];
  return shuffle(mix).slice(0, 25);
}
```

The exact proportions are configurable in `profile.dailyTargetMinutes` but default to the ratios above.

---

## 8. Supabase Auth and Row-Level Security

### 8.1 Authentication Flow

- **Provider:** Supabase Auth (email + password). No OAuth providers are required for the MVP.
- **Session Management:** The `useAuth()` hook reads the Supabase session cookie or JWT from `localStorage` (with `httpOnly` preference for production). The session refresh is handled automatically by the Supabase client library.
- **Anonymous Access:** No anonymous access is permitted. Every API endpoint requires an authenticated user session.

### 8.2 Row-Level Security (RLS) Policies

Every user-facing table has an RLS policy enforcing that rows are accessible only when `user_id` matches `auth.uid()`:

```sql
-- profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- attempts
CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own attempts" ON attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- review_schedule
CREATE POLICY "Users can manage own schedule" ON review_schedule
  FOR ALL USING (user_id = auth.uid());
```

### 8.3 API Route Design

Next.js API routes (`/api/*`) use the Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`) for server-side database access when needed (e.g., for analytics aggregation or background FSRS computation). User-facing endpoints (`/api/session`, `/api/attempt`) use the user's JWT (passed from the client via `Authorization` header or cookie) and rely on RLS policies for data isolation.

---

## 9. Offline / Local-First Behaviour

### 9.1 Strategy

The app is designed to function fully offline after the first successful load of the word list and user profile. The strategy follows the **local-first** principles described in the architecture: the browser is the primary data store; the server is a sync target.

### 9.2 Local Storage Layer

- **IndexedDB:** Used for structured data (`attempts`, `sessions`, `review_schedule`, `user_profile`). The `idb` library (or native `IndexedDB` API wrapped in a thin custom module) provides a reactive store interface.
- **Cache API / Service Worker:** Static assets (`audio`, `images`, `JS` bundles) and the word list JSON are cached via the Service Worker (`sw.js`). This ensures the session can start without a network request.
- **localStorage:** Used only for lightweight settings (preferred voice, daily target minutes) and the auth session token reference.

### 9.3 Sync Strategy

When the browser detects a network connection (`navigator.onLine` or a successful ping to `/api/health`), the sync engine:

1. Reads all un-synced `attempts` from `IndexedDB` (flagged with `synced = false`).
2. Sends them in batches of 50 to `/api/sync/attempts`.
3. Updates the server-side `review_schedule` based on the batch results.
4. Pulls any updated `review_schedule` entries back to the client.
5. Marks the batch as `synced = true`.

**Conflict Resolution:** If the same word has been attempted on two devices, the server accepts both attempts (they are independent records in the `attempts` table). The FSRS engine uses the **latest successful unassisted attempt** to compute the new interval. If two attempts occur within the same minute, the one with the lower error count takes precedence for FSRS scheduling.

---

## 10. Folder Structure

```
my-english-practice/
├── .env                  # DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, etc.
├── drizzle.config.json    # Drizzle ORM configuration
├── src/
│   ├── db/
│   │   ├── index.ts      # Drizzle DB client, connection pool
│   │   ├── schema.ts     # All table definitions (users/profiles, words, attempts, etc.)
│   │   └── seed.ts       # Seed script for levels, words, phonics patterns
│   ├── app/
│   │   ├── layout.tsx    # Root layout with providers
│   │   ├── page.tsx      # Home / landing
│   │   ├── session/
│   │   │   ├── page.tsx  # Main drill page
│   │   │   └── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── phonics/
│   │   │   └── page.tsx
│   │   ├── syllables/
│   │   │   └── page.tsx
│   │   ├── dictation/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── health/route.ts
│   │   │   ├── auth/route.ts      # Auth callbacks, session refresh
│   │   │   ├── session/route.ts     # Session start/end, word selection
│   │   │   ├── attempt/route.ts     # Attempt recording
│   │   │   └── sync/route.ts        # Batch sync endpoint
│   │   └── globals.css   # Tailwind v4 + custom calm colour palette
│   ├── components/
│   │   ├── drill/
│   │   │   ├── DrillCard.tsx
│   │   │   ├── LetterInput.tsx
│   │   │   ├── HintLadder.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── WordDisplay.tsx
│   │   │   └── FeedbackBanner.tsx
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── LevelProgressRing.tsx
│   │   │   ├── FSRSReviewList.tsx
│   │   │   └── SessionHistoryChart.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── SessionTimer.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── ProgressBar.tsx
│   │       └── Card.tsx
│   ├── hooks/
│   │   ├── useDrillEngine.ts
│   │   ├── useFSRS.ts
│   │   ├── useAudio.ts
│   │   ├── useMicrophone.ts
│   │   ├── useSync.ts
│   │   └── useIndexedDB.ts
│   ├── lib/
│   │   ├── fsrs.ts         # FSRS scheduling logic
│   │   ├── validation.ts   # Letter-by-letter validation
│   │   ├── audio.ts        # SpeechSynthesis helpers, voice selection
│   │   ├── similarity.ts   # Levenshtein distance for mic comparison
│   │   ├── sync.ts         # Batch sync, conflict resolution
│   │   └── storage.ts      # IndexedDB wrapper
│   └── types/
│       └── index.ts        # Global TypeScript types
├── public/
│   ├── audio/             # Optional pre-rendered audio assets
│   ├── images/            # Calm, minimal illustrations
│   └── icons/
└── docs/                  # Additional documentation
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── PHASES.md
    └── ROADMAP.md
```

---

## 11. Key Technical Decisions and Reasons

### 11.1 Next.js App Router (Not Vite + React Only)

**Decision:** The repository uses Next.js 16 App Router rather than a standalone Vite React application.

**Reason:** The user described a "free stack" with React and TypeScript, and the existing repository is already configured with Next.js, Drizzle ORM, and PostgreSQL. Next.js provides server-side rendering for the landing page and dashboard (better SEO, faster initial load), server-side API routes for sync and auth, and built-in TypeScript support. The "free hosting" goal is met by deploying to Vercel, which supports Next.js at no cost for hobby projects.

### 11.2 Drizzle ORM (Not Prisma or Raw SQL)

**Decision:** Drizzle ORM is used for all database interactions.

**Reason:** Drizzle provides type-safe SQL with a lightweight footprint, aligns well with the TypeScript-first approach, and integrates cleanly with PostgreSQL. The schema file (`src/db/schema.ts`) serves as the single source of truth for table definitions, which simplifies the local-first sync logic because the same schema can describe both server-side tables and IndexedDB structures.

### 11.3 Browser SpeechSynthesis (Not Pre-rendered Library Only)

**Decision:** The primary audio source is `SpeechSynthesis` with `en-GB` voice selection; pre-rendered audio files are optional fallbacks.

**Reason:** This eliminates the need for a large audio asset library at launch, reduces hosting storage costs (critical for free hosting), and guarantees British English pronunciation regardless of the user's device. The trade-off — slightly less consistent prosody — is acceptable for a spelling-focused product where the primary goal is letter-to-sound mapping, not perfect natural speech reproduction.

### 11.4 Custom FSRS (Not ts-fsrs Library Import)

**Decision:** A custom FSRS scheduler is implemented rather than importing a library.

**Reason:** General FSRS libraries are optimised for card-based flashcard systems (binary correct/incorrect). Our use case requires granular adjustment based on the number of errors per word, the use of hints, and the time spent. A custom implementation (under 200 lines in `src/lib/fsrs.ts`) provides complete control over these variables without adding a dependency.

### 11.5 IndexedDB Local-First (Not Pure Server-Side State)

**Decision:** All drill data is stored locally in `IndexedDB` and synchronised in batches.

**Reason:** The target user may have intermittent connectivity (commute, rural areas, shared devices). A local-first approach ensures the 15–25 minute session is never interrupted by a network failure. The sync mechanism is simple (batch POST to `/api/sync/attempts`) and does not require complex conflict-resolution logic because attempts are append-only records.

### 11.6 Microphone as Supportive Hint (Not Assessment Gate)

**Decision:** The microphone feature provides a calm comparison message and never blocks the user.

**Reason:** Adult beginners often have anxiety around pronunciation. Making the microphone an assessment gate (e.g., "You must pronounce this correctly before continuing") would violate the core design principle of a calm, non-punitive experience. By treating it as an optional, supportive hint, we maintain accessibility for users without microphones and reduce anxiety for users who do use it.

---

## 12. Security and Privacy Considerations

- **Row-Level Security:** Every user-facing table uses RLS policies. The server never returns rows that do not match the authenticated user's `user_id`.
- **Service Role Key:** The `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the client. It is only used in server-side API routes (`/api/sync`) when batch processing requires bypassing RLS for administrative queries.
- **Microphone Data:** Audio captured by `SpeechRecognition` is processed by the browser engine locally. No audio streams or recordings are transmitted to the server. The server only receives the textual transcript result (if any) through the client's `onresult` callback, and this transcript is not stored in the database unless the user explicitly chooses to (it is not stored at all in the current design).
- **Personal Data:** User profiles contain only a display name, preferred voice setting, and practice statistics. No email addresses, phone numbers, or location data are collected beyond what Supabase Auth requires for account creation.
- **AdSense Readiness:** The site uses a minimal, text-focused design with clearly defined content areas. Ad slots (if added) will be placed in the dashboard sidebar or between session pages, never overlaying the drill input area, to comply with AdSense programme policies on non-interfering ad placement.
