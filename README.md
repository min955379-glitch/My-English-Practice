# My English Practice

A calm British English spelling and pronunciation practice website for adult beginners, built with Next.js 16, React 19 and TypeScript.

Repository: [min955379-glitch/My-English-Practice](https://github.com/min955379-glitch/My-English-Practice).

## Current implementation

The website now has working on-device learning flows, rather than page skeletons:

- Listen-and-spell with normal and slow browser speech, immediate wrong-letter feedback, blocking, case-insensitive input, backspace and paste prevention.
- An explicitly requested hint ladder after two incorrect letters: slow replay, first-letter support and syllable breaking.
- Same-session mistake retries, next-day review and the adapted FSRS-style scheduling rules in `ARCHITECTURE.md`.
- Mastery requiring independent success on separate days, including a long review interval.
- Forty-three curated practice items across eight PRD-defined levels, including everyday dictation phrases.
- Phonics and word-family information, syllable stress, listen-and-repeat, optional microphone transcription and short reading-aloud passages.
- A dashboard calculated from actual saved attempts and sessions, not demonstration metrics.
- IndexedDB progress, per-letter checkpoints, session resume, offline operation of the loaded drill and production service-worker caching.
- Preferences, progress export/import, local reset and optional Supabase accounts/cloud sync.
- About, Contact, Help and Accessibility, Privacy and Terms pages; no ads or tracking SDKs.

## Why it exists

Many English-learning tools assume fluent reading and independent spelling. This project starts with listening and small steps, using practical adult vocabulary about work, travel, money and daily life. There are no public rankings or punitive pronunciation grades.

Aim for 15–25 minutes daily. Sessions can be paused or finished early. The initial curriculum is a reviewed starter set, not a complete language course or accredited qualification.

## Quick start

Requirements: Node.js 22.13 or later, npm and a modern browser.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. No database credentials are required for on-device practice. Leave the Supabase variables empty to use guest mode.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Browser tests require a running development or production server:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

Set `TEST_BASE_URL` if the server uses another origin. Browser tests include keyboard spelling, hints, retries, reload persistence, offline practice, mobile layout and automated accessibility checks.

### TypeScript compatibility

TypeScript 7 supplies `tsc` through the `@typescript/native` npm alias. The official TypeScript 6 compatibility package supplies the API required by Next.js's ESLint tooling. The lockfile pins the working combination. Some bundled ESLint plugins report peer-version warnings with ESLint 10; linting, compilation and tests pass.

## Environment variables

| Variable | Use |
| --- | --- |
| `DATABASE_URL` | Server-only PostgreSQL URL; needed for migrations, seed and cloud sync |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public Supabase publishable client key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supported alternative to the publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional server-only admin key for permanent account deletion |
| `NEXT_PUBLIC_SITE_URL` | Optional public deployment origin for sitemap generation |
| `ALLOW_PREVIEW_EMBEDDING` | Set to `1` only for an embedded sandbox preview; leave unset for normal public deployment |

Never put server secrets in `NEXT_PUBLIC_` variables. Keep `.env.local` out of version control. Use the TLS settings required by your database provider; the application does not disable certificate validation.

## Database setup

Use a fresh Supabase PostgreSQL database with its managed Auth schema and `anon` and `authenticated` roles already available.

```bash
npm run db:migrate
npm run db:seed
```

Existing databases created outside the migration history must be backed up and baselined before applying the initial migration. Do not apply a fresh initial migration blindly to existing tables, and do not use destructive schema pushes against learner data.

The schema includes application identities, profiles, settings, levels, phonics patterns, vocabulary, sessions, append-only attempts, review schedules, level progress and a versioned local-first backup. Supabase owns `auth.users`; migrations reference it without recreating it.

Cloud sync verifies the bearer token through Supabase Auth, sets transaction-local identity claims and switches the PostgreSQL transaction to the non-bypass `authenticated` role. The migration includes table grants and ownership RLS policies. The server never trusts a client-provided owner ID. The configured database connection must be permitted to set that role.

Accounts and guest practice use separate browser stores. Export guest progress before signing in if you want to import it into an account. Signing out does not expose the account's data in the guest dashboard.

## Review rules

The checked-in architecture specifies a simplified FSRS-style model, not the reference FSRS algorithm:

- New cards start with a one-day interval.
- Errors or hints reset the interval to one day and increase difficulty.
- Independent success on a later day extends the interval by approximately 2.5 times.
- Same-day repetition cannot earn mastery.
- Three independent successes on different local dates, including a review after at least seven days, are needed for mastery.
- A new error removes mastery.

Same-session retries are a separate queue, limited to two reinsertion cycles per word to avoid an endless session. Unresolved items remain in the next-day review path. Level unlocks require three qualifying sessions on separate dates, including a recent session. Optional pronunciation and dictation previews do not unlock the spelling curriculum.

See `IMPLEMENTATION.md` for documented interpretations of contradictory requirements.

## Browser audio and microphone

The website requests British English voices and clearly labels a standard-English fallback. Device voices may be unavailable or may depend on a network connection. Written assisted practice remains available if audio cannot play.

Microphone recognition starts only after consent and a button press. The browser provider may process speech remotely. This website does not save recordings or transcripts. Feedback is “I heard”, never a pronunciation grade. Real-device permissions and voice quality require manual testing.

## Structure

```text
src/
  app/                 Pages, metadata and authenticated API routes
  components/          Layout, design system and interactive practice
  content/             Shared curated curriculum
  db/                  Drizzle schema, client, migration runner and seed
  hooks/               Browser speech adapter
  lib/                 Learning rules, validation, types and persistence
public/                 Service worker and advertising status file
drizzle/                Versioned SQL migrations and snapshots
tests/                  Learning, database policy and browser tests
validation/             Recorded audit output
```

## Deployment

Deploy the Next.js application to a compatible free hosting plan, subject to that provider's current terms and quotas. Configure public Supabase values before building and server-only database values in hosting settings. Apply migrations and seed to the production database separately. Add the deployment URL to Supabase's allowed authentication URLs.

Keep `ALLOW_PREVIEW_EMBEDDING` unset in public production builds. Production responses then retain frame restrictions. HTTPS is required for secure browser microphone and service-worker features.

`/api/health` is a liveness endpoint. `/api/readiness` checks PostgreSQL and returns HTTP 503 when it is unavailable or unconfigured. Neither endpoint exposes credentials.

Advertising is not enabled. Public information pages and `ads.txt` state the actual implementation. AdSense approval, a configured operator contact method and any necessary consent controls remain deployment work; do not invent a publisher ID.

## Validation and remaining release work

Automated learning tests, embedded PostgreSQL migration/RLS tests, Chromium browser tests, lint and strict type checking pass. Production builds pass. Automated accessibility checks report no violations on the tested pages and mobile wrong-letter state; this is not independent certification.

A local mobile Lighthouse run measured Performance 92, Accessibility 100, Best Practices 96 and SEO 100 on the home page. LCP was 2.6 seconds and CLS was zero. Results vary by deployment and device; the architecture's sub-2.5-second LCP target still needs a deployed audit.

No live Supabase credentials or hosting account are available in this workspace. Hosted authentication, cloud sync, permanent account deletion, real microphone recognition and public deployment have not been end-to-end verified. The source has not been pushed to GitHub by this build.

See `ROADMAP.md` for checked implementation work and remaining release gates.
