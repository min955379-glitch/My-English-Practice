# Open levels, expanded curriculum and voice-choice validation

Date: 14 October 2026. Runtime: Node.js 22.23.3, Next.js 16.4.0 production build served locally on port 3000.

## Final results

| Check | Actual result |
| --- | --- |
| `npm run lint` | Passed, no errors or warnings |
| `npm run typecheck` | Passed, route generation and strict type checking |
| `npm run build` | Passed, all 21 generated entries completed |
| `npm test` | 29 passed, 0 failed, 0 skipped |
| `TEST_PRODUCTION=1 npm run test:e2e` | 42 passed, 0 failed, 0 skipped; final run 55.0 seconds |
| Additional immediate-reload regression repetition | 8 passed, 0 failed |
| JSON/seed validation | 13 levels, 408 practice items, 24 patterns |
| Baseline preservation | All previous 83 item records and every existing level/pattern definition preserved exactly |
| Added content | Exactly 25 additions per level, 325 new items total |

The current command outputs are saved as `open-levels-voices-checks.log`, `open-levels-voices-unit.log`, `open-levels-voices-build.log`, `open-levels-voices-browser.log` and `open-levels-voices-resume.log`.

## Final curriculum counts

| Level | Existing items | Added | Final items |
| --- | ---: | ---: | ---: |
| 1 | 5 | 25 | 30 |
| 2 | 5 | 25 | 30 |
| 3 | 5 | 25 | 30 |
| 4 | 5 | 25 | 30 |
| 5 | 5 | 25 | 30 |
| 6 | 5 | 25 | 30 |
| 7 | 5 | 25 | 30 |
| 8 | 8 | 25 | 33 |
| 9 | 8 | 25 | 33 |
| 10 | 8 | 25 | 33 |
| 11 | 8 | 25 | 33 |
| 12 | 8 | 25 | 33 |
| 13 | 8 | 25 | 33 |
| Total | 83 | 325 | 408 |

All new records include British IPA, written syllable chunks, count, split, stress pattern, a recognised pattern category, word-family information, meaning, a practical example and kind. Case-insensitive within-level duplicate checks pass. No new pattern categories were needed: all 24 existing categories remain unchanged.

## Open access and authentication UI

- Every level option is enabled from a fresh visit. A browser test selects all thirteen options, starts Level 13 with no prerequisite attempts and completes its first phrase.
- Dashboard retains per-level completion and progress bars with no lock icons, lock labels or gated statuses.
- The old unlock helper is compatibility-only and returns the highest curriculum ID without inspecting accuracy or sessions. Unlock fields remain solely as legacy metadata.
- Scheduled reviews can use any real curriculum item, with no locked-level filter. The adapted scheduler, mastery rules and accuracy calculations are unchanged.
- The embedded sign-in/sign-up form, account-creation handlers and email/password inputs are removed. The header link is Settings only. Browser checks confirm login/signup/sign-in/sign-up/register URLs return 404.
- Existing authenticated sessions retain their separate storage, sync, sign-out and deletion controls. No existing account is deleted by removing the UI.

## Voice preference

- Fresh and legacy-normalised settings default to Female. Settings offers Female/Male only.
- Explicit Google UK Female/Male labels and known Microsoft/Apple British names are recognised. Matching en-GB voices are prioritised; an unavailable gender falls back to the best available British voice. Only if no British voice exists is a labelled standard-English fallback used.
- Unknown names are not assigned an invented gender: Web Speech has no standard gender metadata.
- Tests cover Google, Microsoft and Apple naming, case/underscore language tags, missing gender, unknown British voice, absent British/English voices and a legacy preferred URI that must not override the requested gender.
- Browser tests verify actual utterance voice and normal/slow rates across spelling drills, dictation, pronunciation, reading and Settings preview using a deterministic speech API mock. They also cover delayed voice availability, fallback messaging, reload persistence, export and import.
- Import now restores all exported settings, including theme and voice choice. Version-1 exports without voiceGender remain accepted. Invalid gender values are rejected.
- Timestamp-based cloud settings merge includes the voice preference, including edits made before any practice attempts.

## Database, accessibility and regressions

- PGlite embedded PostgreSQL applies all three real SQL migrations, inserts the shared complete seed, checks 13 levels and 408 items, and re-runs word upserts without duplicates.
- Migration 0002 adds constrained `voice_gender` with default female. Male round-trip and invalid-gender rejection pass. Historical migrations 0000/0001 are unchanged; snapshot 0002 and the journal are included.
- Existing cross-user RLS, immutable-attempt, session ownership, invalid-level rejection and deletion-cascade tests pass.
- Axe WCAG 2 A/AA and WCAG 2.1 AA checks found no violations across all thirteen user-facing pages in both themes, including mobile wrong-letter and completed-word feedback states. Horizontal overflow checks at 375 pixels pass.
- Existing hints, mistake reinsertion, dashboard accuracy, durable resume, loaded offline drill, cached offline navigation, unauthenticated APIs, theme persistence and prepaint theme restoration regressions pass.

## Regression found and fixed

The first expanded-suite run exposed a timing race when an immediate reload interrupted asynchronous IndexedDB draft writes. A small account-scoped transient browser-storage checkpoint now protects the unfinished letter draft until its commit succeeds. Restoring does not advance the queue or alter attempts/reviews. The unchanged rapid-reload browser test passed eight consecutive repetitions after the fix, and the final complete suite also passed.

## Remaining external verification

No live Supabase or public deployment credentials were available. Hosted migrations/seed, existing-session cross-device sync and hosted account deletion have not been verified against a real project. Embedded PostgreSQL and local cloud-merge tests are not a hosted round trip.

Actual device voices, sound quality, microphone permissions and recognition need manual testing. Mocked voice tests prove selection and playback parameters, not the sound of an installed voice. Independent editorial review of vocabulary and regional IPA variants remains advisable. Automated accessibility checks are not independent WCAG certification.

The earlier `theme-levels-*` logs and `lighthouse-home.json` are historical artefacts, not results for this update. The earlier home Lighthouse LCP was 2.6 seconds; no new performance audit or deployed sub-2.5-second result is claimed.

The local preview uses `ALLOW_PREVIEW_EMBEDDING=1` only for the sandbox. Leave it unset on public hosting.
