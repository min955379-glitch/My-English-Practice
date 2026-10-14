# My English Practice — midnight studio release validation

Date: 14 October 2026. Tested against the final Next.js production build on Node 22.

## Delivered

- Midnight blue/violet/slate light and dark palettes; no former pale-green palette. Stronger typography, gradient headings, custom SVG gear, icon-only sun/moon control, responsive cards and finite motion with reduced-motion support.
- Custom themed comboboxes instead of native select pop-ups. Keyboard navigation, selected/disabled states, typeahead, outside/Escape dismissal and viewport-aware menus.
- Improved typing tiles, active-slot scrolling and letter progress. Wrong-letter red remains confined to wrong-letter feedback.
- `/learn` searchable curriculum, `/guides` practical learning strategies and `/planner` persistent seven-day plan. Planner choices and ticks export/import; a new week preserves choices and resets ticks without changing actual progress or review schedules.
- Preference/planner checkpoints survive immediate reload; all saved settings retain System/Light/Dark, daily aim, gender, slow speed and audio source.
- Optional consent-based server speech adapter for Ryan (British male) and Sonia (British female), with lesson allowlist, origin checks, bounded caches, rate/character guards and device fallback. The preview is **unconfigured**, not a demonstration of live Azure voices.
- All 13 levels remain immediately open; 408 curriculum items and 24 phonics patterns preserved. No login/signup screens or entry points. Mastery and review rules remain unchanged.

## Executed checks

| Check | Final result |
|---|---|
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm test` | 40 passed, 0 failed, 0 skipped |
| `npm run build` | Passed; optimised production build |
| `TEST_PRODUCTION=1 npm run test:e2e` | 56 passed, 0 failed |
| Planner immediate-reload repeat test | 8/8 passed |

Browser suite: axe checks on 16 pages in both light and dark themes; wrong-letter mobile state in both themes; mobile open-dropdown axe/keyboard check; all thirteen levels and direct Level 13 start; saved gender across playback modes and export/import; delayed/missing device voices; preference persistence; drill checkpoints; offline loaded drill and cached production pages; searchable learning hub, guides and planner links; consent gating, chosen enhanced gender/rate, imported source without permission, and explicit quota-failure fallback. Browser/provider speech uses controlled mocks when testing voice identity or playback; actual spoken quality is not implied.

Unit suite includes embedded PostgreSQL migrations, grants and RLS, default/valid/invalid `audio_source`, curriculum metadata/counts, scheduling/mastery, settings sync and validation, ISO Monday/timezone rollover, pending preference recovery, provider SSML/voice/rate mapping, allowlisted requests, same/canonical-origin checks, API consent/size/rate/cache/error handling and contrast pairs. No external database or speech provider was contacted.

Visual inspection: desktop home and mobile dark Settings/open menu reviewed from browser screenshots. Additional final screenshots cover desktop practice, learning hub and planner, and mobile home/Settings. Screenshots are evidence, not real-device approval.

## Limits and remaining operator checks

- No Azure credentials/resource were provided; no live Ryan/Sonia audio was generated or evaluated. Enable enhancement only with an appropriate free-tier resource, server key/region, canonical site origin and this-browser consent. Current provider availability, quota and billing terms must be checked by the operator.
- Limits and caches are per server instance, not distributed or persistent billing controls. Provider free-tier quota and a shared limiter are needed for a scaled public deployment.
- Physical Android/iOS voice engines, permissions, playback quality and assistive technologies still require manual checks. Automated tests use Chromium and mobile viewports, not physical Android Chrome.
- No live Supabase migration, cloud sync or account deletion test; embedded PostgreSQL verifies schema/RLS locally. `0003_enhanced_audio.sql` is supplied, not applied to a hosted database.
- The website is running in the workspace preview, not publicly deployed or pushed to GitHub.
- Historical Lighthouse reports in this folder concern the older design. Lighthouse was not rerun for this redesign; no current performance score or accessibility certification is claimed.

## Evidence

`midnight-{lint,types,unit,build,browser,planner-repeat}.log` contain current command output. `screenshots/` contains final rendered captures. Older logs are retained as historical evidence and are not the results above.
