# My English Practice

A calm British English spelling and pronunciation practice website for adult beginners, built with Next.js 16, React 19 and TypeScript.

Repository: [min955379-glitch/My-English-Practice](https://github.com/min955379-glitch/My-English-Practice).

## Current implementation

The website now has working on-device learning flows, rather than page skeletons:

- Listen-and-spell with normal and slow device speech, plus optional consent-based enhanced British audio, immediate wrong-letter feedback, blocking, case-insensitive input, backspace and paste prevention.
- An explicitly requested hint ladder after two incorrect letters: slow replay, first-letter support and syllable breaking.
- Same-session mistake retries, next-day review and the adapted FSRS-style scheduling rules in `ARCHITECTURE.md`.
- Mastery requiring independent success on separate days, including a long review interval.
- 408 practice items across thirteen fully open levels: the previous 83 items plus 25 new items per level, using British spelling. Levels 1–7 contain 30 items each; Levels 8–13 contain 33 each.
- Phonics and word-family information, syllable stress, listen-and-repeat, optional microphone transcription and short reading-aloud passages.
- A dashboard calculated from actual saved attempts and sessions, not demonstration metrics.
- IndexedDB progress, per-letter checkpoints, session resume, offline operation of the loaded drill and production service-worker caching.
- System/Light/Dark themes and Female/Male British English playback preferences, saved with progress export/import and existing-session cloud sync. Sign-in/sign-up forms and entry points are removed.
- Midnight blue/violet visual system, gradient headings, subtle finite animations, a distinct settings gear and icon-only header theme toggle.
- Custom themed, keyboard-accessible selectors on mobile and desktop; immediate-reload checkpoints for preferences and planner edits.
- Searchable learning hub, six practical study guides and a saved weekly planner. Planner ticks never earn mastery or alter review dates.
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
| `NEXT_PUBLIC_SITE_URL` | Canonical public origin for sitemap and speech-origin validation behind a reverse proxy; set when enabling enhanced audio |
| `AZURE_SPEECH_KEY` | Optional server-only Azure Speech resource key |
| `AZURE_SPEECH_REGION` | Optional Azure resource region, for example `uksouth` |
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

Guest and existing authenticated sessions use separate browser stores. This application no longer provides login, sign-up or registration screens or forms. Existing sessions retain sync, sign-out and deletion controls; authentication APIs are not exposed through new UI entry points. All practice and settings work without an account.

## Review rules

The checked-in architecture specifies a simplified FSRS-style model, not the reference FSRS algorithm:

- New cards start with a one-day interval.
- Errors or hints reset the interval to one day and increase difficulty.
- Independent success on a later day extends the interval by approximately 2.5 times.
- Same-day repetition cannot earn mastery.
- Three independent successes on different local dates, including a review after at least seven days, are needed for mastery.
- A new error removes mastery.

Same-session retries are a separate queue, limited to two reinsertion cycles per word to avoid an endless session. Unresolved items remain in the next-day review path. All levels are selectable from the first visit, regardless of attempts, accuracy or account status. Unlock fields remain in the seed/schema only for compatibility; no learning rule gates access. Reviews from any level are eligible on their scheduled date.

See `IMPLEMENTATION.md` for documented interpretations of contradictory requirements.

## Browser audio and microphone

Settings offers Voice: Female / Male (default Female). All playback uses the same preference-aware British English voice selector. Explicit Google UK Female/Male labels and known Microsoft/Apple British voice names are recognised. If the requested named gender is unavailable, the best installed en-GB voice is used; a clearly labelled standard-English fallback is used only if no en-GB voice exists. Web Speech provides no standard gender metadata, so unknown voice names are not guessed. Device voices may be unavailable or may depend on a network connection. Written assisted practice remains available if audio cannot play.

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

An earlier, pre-redesign local mobile Lighthouse run measured Performance 92, Accessibility 100, Best Practices 96 and SEO 100 on the home page. LCP was 2.6 seconds and CLS was zero. Results vary by deployment and device; the architecture's sub-2.5-second LCP target still needs a deployed audit.

No live Supabase credentials or hosting account are available in this workspace. Hosted authentication, cloud sync, permanent account deletion, real microphone recognition and public deployment have not been end-to-end verified. The source has not been pushed to GitHub by this build.

See `ROADMAP.md` for checked implementation work and remaining release gates.

## Theme and advanced curriculum update

`src/content/curriculum.json` is the shared UI/Drizzle seed source: 13 levels, 408 practice items and 24 patterns. Levels 1–7 contain 30 items each and Levels 8–13 contain 33 each, including necessary, embarrass, accommodation, conscience, rhythm and questionnaire. Level 13 adds longer formal phrases and sentences. Pronunciation lists every level; dictation discovers phrase/sentence levels from the data.

Apply `drizzle/0001_advanced_levels_theme.sql` using the existing migration runner before re-running `npm run db:seed`. It widens the levels check to 1–13 and adds the constrained System/Light/Dark preference. Historical migration 0000 is unchanged. Drizzle journal and snapshot 0001 are checked in.

The theme defaults to System. The header cycles System → Light → Dark; Settings offers the same choices. IndexedDB settings are canonical, with a synchronous localStorage mirror used by the root head script before first paint. System observes OS changes; explicit selections do not. Legacy exports without a theme import as System. New preference edits carry a timestamp so cloud merge restores the latest settings, including theme edits made before any drills. Existing authenticated-session restoration, reconnect, session-finish and manual sync triggers remain; there is no sign-in/sign-up UI.

Semantic text colours pass the automated WCAG AA checks in both palettes. `@custom-variant dark` targets the root `.dark` class, not only the OS media query. Muted text is intentionally darker than the original light palette's decorative slate so ordinary text meets AA. This automated coverage is not a substitute for an independent accessibility audit.

## Open levels, larger curriculum and voice choice

The latest explicit requirements supersede the original PRD's unlock rules. Level access is unconditional; the compatibility `unlockedLevel` helper returns the highest curriculum ID without inspecting progress. Dashboard completion and accuracy, attempt recording and adapted FSRS-style scheduling remain unchanged. The shared review queue no longer filters out content on the basis of a lock.

Apply `drizzle/0002_voice_choice.sql` through the existing migration runner before syncing the new settings, then run the shared idempotent database seed. The migration adds a constrained `voice_gender` column with default `female`; snapshot 0002 and the journal are included. All 325 new items come from the same JSON as the app and seed. The prior 83 records and all 24 pattern definitions are preserved.

New and read-normalised settings default to Female; legacy exports may omit voiceGender. New exports include it, importing restores all exported preferences, and existing cloud backup merge persists it with the preference timestamp. Old `preferredVoice` URIs remain compatible but cannot override a matching requested-gender British voice.

A small account-scoped, transient browser-storage checkpoint protects unfinished letter drafts during an immediate reload while IndexedDB writes complete. It never advances a session queue or changes attempts/reviews. Successful commits clear the checkpoint.

Current validation: lint, typecheck and production build pass; 29 unit/database tests and 42 production browser tests pass. Device speech is mocked in deterministic browser tests to assert the actual selected voice and playback rate across drills, dictation, pronunciation and reading. Listen manually on the target device for voice quality. See `validation/RESULTS.md` and the `open-levels-voices-*` logs for details.

## Midnight studio redesign

New routes: `/learn`, `/guides` and `/planner`. `/session?level=13` and `/pronunciation?level=13` open that level directly; invalid levels fall back safely. System theme remains available in Settings even though the header uses only a sun/moon icon.

Current release validation: 40 unit/database/API tests and 56 Chromium browser tests passed, plus eight repeated immediate-reload planner checks. The browser suite includes axe checks on sixteen pages in both themes, mobile open-menu accessibility, saved voice/daily aim, offline practice, keyboard menus, deep links, audio consent and quota fallback. These are automated Chromium/mobile-viewport checks, not physical Android or iOS certification. See `validation/RESULTS.md`.

### Optional reliable named British audio

Device speech cannot install a missing male voice. The optional server adapter explicitly requests **en-GB-RyanNeural (male)** or **en-GB-SoniaNeural (female)**; it does not imitate a male voice by changing pitch.

1. An operator must create a supported **Azure Speech F0 (free-tier)** resource and confirm its region, availability and current quota. Do not select a paid tier if you require zero paid usage. Check [Microsoft's official pricing](https://azure.microsoft.com/en-us/pricing/details/speech/) and [voice documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support). A third-party resource/account is needed; learners still need no account in this application.
2. Set server-only `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`; never expose the key as `NEXT_PUBLIC_`. Set `NEXT_PUBLIC_SITE_URL` to the exact HTTPS deployment origin for reverse-proxy origin checks. Restart/redeploy; refresh the browser.
3. In Settings, grant permission to send listed lesson text to Microsoft in **this browser**, choose **Enhanced British audio**, then choose Female or Male and use **Try this voice**. Permission is not included in backups or cloud sync.
4. Apply `0003_enhanced_audio.sql` through the normal migration runner if using the existing cloud-sync database. Guest mode requires no database. The migration adds `audio_source`; the planner is stored in the existing settings snapshot.

The app sends only allowlisted curriculum, reading, phonics and instruction text—not typed answers, private notes, microphone audio or recordings. It caches up to 32 clips and limits requests to 30 per minute per IP and 10,000 characters per day **per server instance**. For multi-instance public hosting, use a shared limiter or enforce resource quotas; the in-memory guard is not a global billing guarantee. Provider quota, configuration or network failures fall back visibly to device speech.

**No Azure credentials were supplied, no resource was created, and real Azure audio was not called or listened to during this build.** Provider requests/playback and failures were tested with mocks. The live workspace preview intentionally reports enhancement as unconfigured; a named male voice is therefore not guaranteed on a device without an installed male voice until the operator completes the setup above. Physical-device playback and production hosting remain release checks.
