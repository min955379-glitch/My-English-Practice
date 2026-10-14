# Project Rules (RULES.md)
# My English Practice
| Field | Value |
|---|---|
| Project | My English Practice |
| Repo | min955379-glitch/My-English-Practice |
| Audience | Human developers and AI assistants working on the repository |
| Status | Mandatory — all rules apply to every change |
| Last Updated | 2026-01-15 |
---
## 1. British English Only — UI Copy and Word Lists
Every piece of text in the user interface, every word in the drill, every pattern description, and every error message uses **Standard Southern British English (SSBE / Received Pronunciation)**. No exceptions.
### 1.1 Word List Rules
- All words in the database (`words` table) must be British English spellings: `colour`, `centre`, `favourite`, `programme` (when referring to a TV show or schedule), `neighbour`, `travelling`, `defence`, `analyse` (verb), etc.
- American variations (`color`, `center`, `favorite`, `program`, `neighbor`, `traveling`, `defense`, `analyze`) must never appear in the word list.
- If a word has a different British pronunciation or spelling, the British form is the canonical version. Examples: `schedule` (`/ˈʃedjuːl/` in SSBE), `mobile` (`/ˈməʊbaɪl/`), `garage` (`/ˈɡærɑːʒ/`), `leisure` (`/ˈleʒə/`).
- The `audioUrl` (if pre-rendered) and `SpeechSynthesis` utterance must always use `lang="en-GB"`.
### 1.2 UI Copy Rules
- All button labels, headings, descriptions, instructions, and messages must use British English vocabulary and grammar.
- Examples of required British forms in copy:
- "Practise" (verb) — not "Practice"
- "Favourite" — not "Favorite"
- "Colour" — not "Color"
- "Centre" — not "Center"
- "Programme" (when meaning a plan, schedule, or broadcast) — not "Program"
- "Travelled" — not "Traveled"
- The word "Spelling" (British) is used; "Speling" is never used.
- Dates and numbers must follow British format where applicable: `15 January 2026` (day before month), `15/01/2026` for compact dates, and decimal points (`.`) for fractions.
### 1.3 Audio and Speech Rules
- `SpeechSynthesis` utterances must set `lang = "en-GB"`.
- Voice selection must prefer British English voices (`voiceURI` containing `en-GB`, `GB`, or `UK` in the name).
- The microphone feature (`SpeechRecognition`) must set `lang = "en-GB"`.
- Any pre-rendered audio assets must be recorded or generated with a British English speaker or voice model.
---
## 2. No Emojis — Icons / SVG Only
There are **absolutely no emojis** (`😀`, `🎉`, `✅`, `❌`, `⭐`, `🔥`, `💪`, `👍`, `👎`, `🎯`, `🚀`, `💡`, etc.) anywhere in the website, code comments that are user-visible, documentation, or commit messages that describe the product.
### 2.1 What Must Be Used Instead
- All visual symbols must be custom inline SVG (`<svg>`) with `aria-label` or `aria-hidden="true"`.
- Examples:
- A play button uses an SVG triangle (`▶`), not the emoji `▶`.
- A checkmark uses an SVG path (`✓`), not the emoji `✅`.
- A microphone uses an SVG microphone shape, not the emoji `🎤`.
- A star (if ever needed for decoration, which it should not be) uses an SVG star path, not the emoji `⭐`.
### 2.2 Where This Applies
- UI components: buttons, cards, banners, navigation.
- Error and success messages: text only, no emoji prefixes (`❌ Wrong` is forbidden; use `Not quite. Try again.`).
- Dashboard metrics: numbers only, no emoji indicators.
- Documentation files (`README.md`, `PRD.md`, `ARCHITECTURE.md`, `PHASES.md`, `DESIGN.md`, `RULES.md`, `DEPLOYMENT.md`): text descriptions, no emoji bullet points.
- Code comments: describe behaviour in words, not with emoji annotations.
---
## 3. Calm Supportive Tone in Every Message
Every message the user sees — whether it is a button label, a hint, a feedback message, an error explanation, or a dashboard caption — must be calm, supportive, non-judgemental, and adult-oriented.
### 3.1 Tone Guidelines
- **Never use imperative commands that sound like orders.** Instead of "Type the word!" use "Type the word at your own pace."
- **Never use exclamation points excessively.** One calm exclamation is acceptable for positive confirmation (e.g., "Well done." is fine without any exclamation mark). Multiple exclamation points (`!!!`) are forbidden.
- **Never use negative or shaming words.** Words like "Wrong!", "Incorrect!", "Mistake!", "Fail!", "Error!" are forbidden. The only word describing an incorrect letter is the calm message: "Not quite. Try that letter again."
- **Always assume the user is trying their best.** Phrases like "Remember the silent 'e'" or "The sound is /ʃ/ — try that letter" are supportive. Phrases like "You forgot the silent 'e'" or "That was wrong" are not.
- **Use second person gently.** "Your session" is fine. "You need to fix this" is not.
### 3.2 Message Examples (Approved)
| Context | Approved Message | Forbidden Message |
|---|---|---|
| Wrong letter | "Not quite. Try that letter again." | "Wrong!", "Incorrect!", "❌" |
| Completed word | "Good. Next word ready." | "Perfect! ⭐", "Awesome! 🔥" |
| Session finished | "Session complete. Take a break if you'd like." | "You won!", "Score: 100" |
| Hint available | "A little help is available if you'd like it." | "You failed twice! Here is help!" |
| Audio unavailable | "Audio unavailable in this browser. You may still practise spelling." | "Audio error!", "Speech synthesis failed!" |
| Offline | "Practising offline. Changes will sync when connected." | "No internet! You cannot save!" |
---
## 4. Core Drill Behaviour Is Never Weakened
The core listen-and-spell drill is the beating heart of the product. Its behaviour is defined in `PRD.md` and `ARCHITECTURE.md` and must never be changed, simplified, or bypassed without explicit approval.
### 4.1 Non-Negotiable Rules
- **Wrong letter turns red (`calm-red`, `#ef4444`).** No other colour, no background change, no icon added.
- **Blocked until correct.** The user cannot skip ahead, cannot reveal the full word, and cannot proceed to the next word until every letter in the current word is correct.
- **Hints only after 2 fails.** The hint ladder does not appear until the user has completed the word twice with at least one error on each attempt (or has 2 consecutive incomplete attempts with errors). It never activates on the first error.
- **Hints are user-activated, never automatic.** The user must click a button to receive each level of the ladder. There is no countdown, no forced reveal, and no automatic progression.
- **No full answer reveal.** The hint ladder provides replay with emphasis, first-letter reveal, and syllable split — but it never shows the full correct spelling of the word.
- **Slow audio never reveals letters.** The slow replay (`SpeechSynthesis` rate `0.65` or pre-rendered slow file) plays the sound only. It does not highlight, reveal, or change any letter in the input.
- **Microphone is a supportive hint only.** It never blocks progression, never assigns a grade, and never replaces the spelling validation.
### 4.2 What Must Not Be Added
- No "skip word" button that bypasses the blocking rule.
- No "reveal answer" button that shows the full word.
- No automatic hint activation (e.g., after 30 seconds of inactivity).
- No scoring or point deduction based on errors.
- No timer pressure (the session timer measures duration, it does not count down or enforce a speed limit).
---
## 5. Secrets Never Committed — `.env` Stays Local
No secret, token, password, or private key must ever be committed to the Git repository.
### 5.1 What Is a Secret
- `DATABASE_URL` (contains database credentials)
- `NEXT_PUBLIC_SUPABASE_URL` (public but environment-specific; the `.env` file itself must not be committed)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Any future API keys, webhook secrets, or authentication tokens.
### 5.2 File Handling Rules
- `.env` is listed in `.gitignore`. It must never appear in the repository.
- `.env.example` is committed. It contains placeholder values (`your_database_url_here`, `your_anon_key_here`) and comments, but no real values.
- If a developer accidentally commits `.env`, it must be removed from history (`git rm --cached .env` + `git filter-branch` or BFG Repo-Cleaner) and rotated immediately (all secrets must be regenerated).
- All secrets must be loaded from environment variables (`process.env.VAR_NAME`) or from `.env` via `dotenv`. No hardcoding in any file (`src/`, `public/`, `config/`).
---
## 6. Database Changes Only Via Migrations
All database schema changes must go through the Drizzle ORM migration process. Direct SQL edits to the database that are not recorded in `src/db/schema.ts` and `drizzle/` are forbidden.
### 6.1 Migration Workflow
1. Modify `src/db/schema.ts` to add, change, or remove tables/columns.
2. Run `npx drizzle-kit generate` to create the SQL migration file in `drizzle/`.
3. Review the generated SQL to confirm it matches the intended change.
4. Apply the migration with `npx drizzle-kit migrate` (development) or `npx drizzle-kit push` (sandbox/bootstrap, as allowed by the deployment guide).
5. Update the seed script (`src/db/seed.ts`) if the change affects reference data (words, patterns, levels).
6. Commit both the schema change (`src/db/schema.ts`) and the migration file (`drizzle/*.sql`) together.
### 6.2 What Is Forbidden
- Running `ALTER TABLE` or `CREATE TABLE` via `psql` or any database client without recording the change in `src/db/schema.ts`.
- Deleting migration files from `drizzle/` after they have been applied.
- Changing column types or constraints without a migration.
- Adding new required (`.notNull()`) columns without a default value or a data migration.
---
## 7. Type Check and Build Must Pass Before Any Push
Every change to the repository must pass the full validation sequence before it is committed or pushed. No exceptions.
### 7.1 Validation Sequence (In Order)
Every developer (human or AI) must run these commands from the project root before committing:
```bash
# 1. TypeScript type generation
npx next typegen
# 2. TypeScript compilation (no emit)
npm exec tsc -- --noEmit --pretty false
# 3. Production build
npm run build
```
### 7.2 Acceptance Criteria
- `npx next typegen` must return exit code `0` and show no errors.
- `npm exec tsc -- --noEmit --pretty false` must return exit code `0` and show zero errors (`0 errors in ...`).
- `npm run build` must return exit code `0`, show `Compiled successfully`, show `Finished TypeScript`, and produce no build errors or warnings.
- The build output must include all expected routes (`/`, `/session`, `/dashboard`, `/phonics`, `/syllables`, `/dictation`, `/profile`, `/api/health`, `/api/auth/*`, etc.).
### 7.3 What Happens If Validation Fails
- If any step fails, the change must not be committed or pushed.
- The error message must be read (`cat /tmp/next-typegen.log`, `cat /tmp/tsc.log`, `cat /tmp/build.log`).
- The issue must be fixed (usually a missing import, a type error, or a syntax error).
- The validation sequence must be run again from step 1.
- Only after all three steps pass is the code ready for `build_and_start` and final verification.
---
## 8. Step-by-Step Working Method
All work on this repository follows a strict, repeatable method. This applies to human developers writing code and to AI assistants generating or editing files.
### 8.1 Before Making Any Change
1. Read the relevant documentation (`PRD.md` for feature requirements, `ARCHITECTURE.md` for data model and component design, `DESIGN.md` for visual rules, `PHASES.md` for build order).
2. Confirm the change aligns with the current phase in `PHASES.md`.
3. Check `.env.example` to confirm no required environment variables are missing.
### 8.2 Making the Change
1. Create or edit the file using the provided tools (`create_file`, `edit_file`).
2. Write complete, real content — no placeholders (`[TODO]`, `TBC`, `...`), no partial implementations, no stub functions that return empty strings or `null` unless explicitly required by the architecture (e.g., a feature that is planned for a future phase must not have a stub component; it simply does not exist yet).
3. Ensure British English spelling is used in all new text.
4. Ensure no emojis are added.
5. Ensure the calm, supportive tone is maintained in all user-facing text.
6. Ensure the core drill behaviour (red letter, block, hints after 2 fails) is preserved in any drill-related changes.
### 8.3 After Making the Change
1. Run `npm run build` and fix any errors.
2. Run `npm exec tsc -- --noEmit --pretty false` and fix any type errors.
3. Run `npx next typegen` and confirm route types are updated.
4. If database schema was changed, run `npx drizzle-kit push` or the appropriate migration.
5. If the change affects user-facing behaviour, verify it in the browser preview (via `build_and_start`).
6. Only after all checks pass, confirm the change is complete.
---
## 9. What This Project Is Not
These rules clarify the boundaries of the project. They prevent scope creep and ensure the product remains focused on its core purpose.
- This is **not** a full English course. It teaches spelling, pronunciation awareness, and basic phonics — not grammar, not conversation, not professional writing.
- This is **not** a competitive game. There are no scores, no leaderboards, no badges, no rankings.
- This is **not** an American English resource. British English (`en-GB`) is the only standard.
- This is **not** a clinical speech-therapy tool. The microphone feature is a supportive practice aid, not a diagnostic assessment.
- This is **not** a paid product. All core features are free. Any future monetisation (e.g., AdSense) must never block or restrict the core drill.
---
*These rules are mandatory. Any change that violates any rule — British English standard, emoji prohibition, calm tone, core drill behaviour, secret handling, migration process, or validation sequence — must be corrected immediately. No exceptions are made for convenience, speed, or temporary workarounds.*
