# Implementation notes

## Instruction sources

The current `PRD.md`, `ARCHITECTURE.md` and `PHASES.md` were retrieved from the repository's main branch. `DESIGN.md` and `RULES.md` were not present in that repository listing. The provided calm colour palette, British English copy, SVG-only icons and red-only-wrong-letter rules remain in force.

## Interpreting conflicting requirements

1. **Hints:** the initial brief requests help after two wrong letters, while the PRD variously refers to failed words and completed attempts. Since incorrect letters block progression, this implementation activates hints after two incorrect keystrokes and requires an explicit click. Further stages require another attempted letter. No hints appear automatically.
2. **Corrections:** the PRD says not to reveal the expected letter immediately. The implementation therefore uses “Not quite. Try that letter again.” rather than automatically displaying the correct letter. First-letter and syllable support are requested through hints.
3. **Completion:** progress to the next word is explicit, not forced after 1.5 seconds. Adult beginners need time to read the meaning, replay the word and hear the example sentence.
4. **FSRS:** the repository explicitly requests a custom simplified model rather than a reference library. The UI and documentation identify it as an adapted FSRS-style scheduler. It is not represented as mathematically equivalent to reference FSRS.
5. **Open levels:** the latest user instruction explicitly replaces the earlier unlock rules. Every level is immediately selectable for guests and existing authenticated sessions. Compatibility fields stay in the JSON/schema; no accuracy threshold or session count gates access. The compatibility helper returns the maximum level without reading learner history.
6. **Review eligibility:** the previous locked-level review filter has been removed. Reviews from any real curriculum item retain their existing due-date and mistake-queue ordering. Accuracy, mastery and scheduling calculations are otherwise unchanged.
7. **Microphone privacy:** the architecture says processing is local, but browsers may use remote recognition providers. Consent and privacy copy state this limitation accurately.
8. **Health:** the previously requested `/api/health` response remains simple liveness. Database readiness is exposed separately and never falsely reports an unconfigured database as connected.
9. **Advertising:** no advertisements, trackers or fictional publisher IDs are installed. Public information pages are present, but AdSense approval is not claimed.

## Security boundaries

- Supabase Auth owns identities and credentials.
- Application users reference Auth identities without duplicating email or password data.
- Guest and account browser stores are separated.
- Sync requests authenticate their JWT before database access.
- Database transactions switch to the `authenticated` role and set transaction-local JWT claims.
- RLS limits private rows to their owner; attempts cannot be updated by the authenticated role.
- A composite session-owner foreign key prevents attempts referencing another learner's session.
- A per-user transaction advisory lock prevents simultaneous sync requests losing each other's merged backup.
- Administrative keys are only used in the server account-deletion endpoint.
- The service worker caches public assets, not account API responses.
- Export/import and server sync validate the versioned data structure.

## Release limits

The on-device learning experience is implemented and browser-tested. Live Supabase integration and hosting require actual operator credentials. Microphone recognition, British voice availability and provider behaviour require real-browser manual tests. Content now contains 408 items across thirteen levels: 30 each in Levels 1–7 and 33 each in Levels 8–13, including 325 additions to the previous 83 records. Independent editorial review and recorded reference audio remain release work.

## Theme persistence

Theme is an optional union field only for backwards-compatible version-1 exports. Fresh and loaded settings normalise to System. IndexedDB remains canonical; the synchronous localStorage theme mirror lets the root head script apply `.dark` and native `color-scheme` before paint. Settings edits are timestamped; cloud backup merge selects the latest preferences and the normalised SQL `user_settings` row persists theme. Pending local preference edits are not overwritten by an in-flight sync response. No real hosted Supabase round trip is claimed without credentials.

Dark styling uses semantic CSS tokens for every existing component and Tailwind v4's class-based custom variant. Colours are deliberately shared by role instead of inverting images or applying a whole-page filter. Red #ef4444 remains exclusive to wrong-letter feedback.

## Voice and authentication UI update

Settings now offers a Female/Male preference, default Female for fresh data and legacy version-1 exports. Web Speech voice objects have no standard gender property. The shared selector therefore uses explicit gender labels and a documented set of known British Microsoft/Apple names. It selects a matching en-GB voice first, then the best available en-GB voice, then a labelled English fallback. It never substitutes a non-British matching gender ahead of an available British voice. Deterministic unit and browser tests cover voice naming, fallbacks, delayed availability, normal/slow playback, persistence, import/export and cloud merge. Actual sound quality and installed-voice availability require a target-device check.

All playback routes continue through `useSpeech`: drills and spoken instructions, phonics, pronunciation, dictation, reading and the Settings preview. Migration 0002 persists `voice_gender`; cloud snapshots also include it. The older preferred voice URI is retained for compatibility and used only within the best eligible pool.

The embedded sign-in/sign-up form, credentials fields, account-creation handlers and their UI entry points are removed. No login, signup or register page routes exist; browser tests confirm they return 404. Existing authenticated sessions still have sync, sign-out and deletion controls, preserving the requested settings sync and private account data. Backend account APIs and scoped storage remain; this is not represented as deletion of existing accounts.

The full browser regression run exposed a rapid-reload race in asynchronous draft saving. A small account-scoped write-ahead checkpoint now protects the unfinished letter position until IndexedDB commits, without modifying recorded attempts or review rules. Restoring cannot advance the queue, recreate a finished session or alter attempts/reviews. Eight repeated immediate-reload tests passed after the fix.
