# My English Practice — Implementation roadmap

## Phase 0 — Foundation

- [x] Next.js 16 App Router, React 19, strict TypeScript and Tailwind v4.
- [x] Calm responsive layout, Inter, keyboard focus and SVG icons.
- [x] PostgreSQL schema, migration runner and idempotent vocabulary seed.
- [x] RLS policies, grants and ownership constraints.
- [x] Environment template and automated checks.
- [x] Liveness and database-readiness endpoints.
- [ ] Apply migrations and seed to the operator's live Supabase project.

**Done when:** the local foundation is tested and the live database is verified. Local implementation passes; hosted database verification remains open.

## Phase 1 — Listen-and-spell

- [x] Normal and slow speech, replay and written audio fallback.
- [x] Immediate letter checking, red wrong letters and advancement blocking.
- [x] Explicit hint ladder after two incorrect letters.
- [x] Completion meanings and spoken example sentences.
- [x] Attempt and mistake recording in IndexedDB.
- [x] Same-session retries and next-day reviews.
- [x] Session timer, pause, early finish, checkpoints and reload resume.
- [x] Mobile input, keyboard operation and offline loaded-drill tests.

**Done when:** learners can complete, interrupt, resume and review real spelling practice. Automated browser tests pass; real-device voice testing remains advisable.

## Phase 2 — Teaching and progress

- [x] All eight original levels plus advanced Levels 9–13: 408 total practice items and twenty-four patterns.
- [x] Phonics patterns, syllable chunks, stress and word-family metadata.
- [x] Adapted FSRS-style scheduler with separate-day mastery.
- [x] Accuracy, mastery, mistake patterns, level progress and session history.
- [x] All thirteen levels open immediately, with no lock labels, disabled level options or review access gates.
- [x] Local settings, System/Light/Dark themes, Female/Male British voice preference, prepaint restoration and progress export/import.
- [x] Authenticated Drizzle sync and server-side review recomputation.
- [x] Separate existing account/guest stores; all sign-in/sign-up forms and entry points removed.
- [ ] Verify existing-session sync and cross-device restoration against live Supabase.
- [ ] Complete independent teaching/editorial review of the expanded curriculum and regional IPA variants.

**Done when:** local learning and metrics are reliable, and the configured hosted sync path passes live account tests. Local tests pass; cloud verification remains open.

## Phase 3 — Spoken and contextual practice

- [x] Listen-and-repeat reference words with IPA and stress hints.
- [x] Optional recognition with explicit consent and “I heard” feedback.
- [x] Non-recognition alternative and supportive error handling.
- [x] Short adult reading passages and optional self-comparison timer.
- [x] Phrase/sentence dictation with spaces and per-letter corrections, including expanded Levels 8 and 13.
- [ ] Manually test recognition permissions and transcripts on supported real browsers.
- [ ] Review audio quality with an adult beginner using a British English voice.

**Done when:** speaking and reading remain usable without recognition, and real-device audio behaviour is reviewed. Non-microphone browser flows pass.

## Phase 4 — Release preparation

- [x] Responsive landing page and learning pages.
- [x] Automated WCAG AA checks on all thirteen public/practice pages in light and dark, plus mobile wrong-letter and feedback states.
- [x] Public About, Contact, Help, Privacy and Terms pages.
- [x] Production service-worker caching, sitemap and robots rules.
- [x] Progress reset and authenticated account-deletion implementation.
- [x] Security headers and explicit sandbox-only embedding option.
- [x] Production build and production Chromium smoke tests.
- [x] Local Lighthouse audit with results saved in `validation`.
- [ ] Verify live account deletion and production backup procedures.
- [ ] Configure a deployment URL, operator contact details and hosting account.
- [ ] Run deployed performance and real-device accessibility/usability audits.
- [ ] Reach the sub-2.5-second LCP target on the deployed site.
- [ ] Add reviewed reference audio with documented licensing.
- [ ] Apply for AdSense only if desired, using actual publisher details and necessary consent controls.

**Done when:** public hosting, real accounts, privacy operations and deployed audits are verified. The workspace preview is running; public deployment and advertising approval are not claimed.
