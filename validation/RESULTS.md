# Validation results

Validated on 14 October 2026 using Node.js 22.23.3.

| Check | Result |
| --- | --- |
| ESLint | Passed without lint warnings |
| Next.js route type generation and TypeScript checking | Passed |
| Production build | Passed |
| Learning and embedded PostgreSQL tests | 11 passed |
| Production Chromium browser tests | 15 passed |
| Automated accessibility | No violations on seven tested pages and the mobile wrong-letter state |
| Seed structure | 43 practice items, eight levels, 18 patterns |
| Public liveness endpoint | HTTP 200 with status ok |
| Unauthenticated sync and account deletion | HTTP 401 |
| Database readiness without credentials | Reports unconfigured rather than claiming connectivity |

## Browser checks

The production browser suite verifies landing-page mobile overflow, immediate wrong-letter blocking, explicit hint activation, same-session mistake reinsertion, dashboard calculations, progress after reload, phonics mini-drills, phrase dictation, reading passage selection, pronunciation word selection, saved preferences, offline spelling, per-letter session resume and cached-page offline reload.

## Database checks

An embedded PostgreSQL instance applies the actual checked-in migration against test Auth roles and identities. Tests verify profile isolation, cross-user insertion denial, hidden foreign sessions, composite session-owner foreign-key enforcement, append-only attempt permissions and deletion cascades. These checks do not substitute for testing a real Supabase deployment.

## Performance sample

The local mobile Lighthouse home-page report in `lighthouse-home.json` recorded Performance 92, Accessibility 100, Best Practices 96 and SEO 100. Largest Contentful Paint was 2.6 seconds, Total Blocking Time was 250 ms, and Cumulative Layout Shift was zero. This is a sample local audit, not a deployment certification; the specified sub-2.5-second LCP target remains a release check.

## Not yet verified

Real Supabase sign-up, email confirmation, cross-device cloud sync, permanent account deletion, production hosting, actual browser microphone transcription, voice quality and an adult-beginner usability session remain external/manual release gates. No AdSense approval or public GitHub push is claimed.
