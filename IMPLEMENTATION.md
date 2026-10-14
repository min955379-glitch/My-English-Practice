# Implementation notes

## Instruction sources

The current `PRD.md`, `ARCHITECTURE.md` and `PHASES.md` were retrieved from the repository's main branch. `DESIGN.md` and `RULES.md` were not present in that repository listing. The provided calm colour palette, British English copy, SVG-only icons and red-only-wrong-letter rules remain in force.

## Interpreting conflicting requirements

1. **Hints:** the initial brief requests help after two wrong letters, while the PRD variously refers to failed words and completed attempts. Since incorrect letters block progression, this implementation activates hints after two incorrect keystrokes and requires an explicit click. Further stages require another attempted letter. No hints appear automatically.
2. **Corrections:** the PRD says not to reveal the expected letter immediately. The implementation therefore uses “Not quite. Try that letter again.” rather than automatically displaying the correct letter. First-letter and syllable support are requested through hints.
3. **Completion:** progress to the next word is explicit, not forced after 1.5 seconds. Adult beginners need time to read the meaning, replay the word and hear the example sentence.
4. **FSRS:** the repository explicitly requests a custom simplified model rather than a reference library. The UI and documentation identify it as an adapted FSRS-style scheduler. It is not represented as mathematically equivalent to reference FSRS.
5. **Unlocks:** sessions must occur on distinct local dates. The specification's “three sessions” is interpreted in line with the separate-days learning goal, rather than allowing three rapid same-day sessions to unlock a level.
6. **Higher-level previews:** pronunciation, sound-pattern activities and dictation can preview harder content. Due spelling reviews do not bypass locked spelling levels.
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

The on-device learning experience is implemented and browser-tested. Live Supabase integration and hosting require actual operator credentials. Microphone recognition, British voice availability and provider behaviour require real-browser manual tests. Initial content contains forty-three reviewed starter items; additional vocabulary and reference audio are future content work.
