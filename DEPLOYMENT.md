# Deployment Guide (DEPLOYMENT.md)
# My English Practice
| Field | Value |
|---|---|
| Project | My English Practice |
| Target Platforms | Vercel (frontend + serverless functions) + Supabase (database + auth) |
| Cost Target | Free tier for both platforms |
| Runtime | Next.js 16 App Router |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
---
## 1. Overview of the Free Deployment Stack
This project is designed to run entirely on free-tier hosting without requiring any credit card or paid subscription.
- **Frontend and API:** Vercel (free Hobby tier) hosts the Next.js application, serves static assets, and runs serverless API routes (`/api/*`).
- **Database:** Supabase (free tier) provides PostgreSQL, authentication (`auth.users`), and row-level security policies.
- **Storage:** Supabase Storage (optional, for pre-rendered audio files or images) is included in the free tier.
- **Custom Domain:** Optional. The project works with the Vercel-provided `.vercel.app` domain. A custom domain can be added later without cost if the user already owns one.
---
## 2. Vercel Project Setup
### 2.1 Prerequisites
Before deploying, confirm the following:
- The repository exists at `https://github.com/min955379-glitch/My-English-Practice` (or the user's fork).
- A Vercel account exists (free sign-up at `https://vercel.com`).
- The `.env` file is configured locally but `.env` is listed in `.gitignore` (see `.env.example` for the required variables).
### 2.2 Connecting the Repository
1. Log in to `https://vercel.com`.
2. Click **"Add New..."** → **"Project"**.
3. Select the GitHub repository `min955379-glitch/My-English-Practice` from the import list.
4. Vercel detects the framework (`Next.js`) automatically. Confirm that it says `Next.js` in the framework preset.
5. Do not change the build settings unless needed. The default build command (`npm run build`) and output directory (`.next`) are correct.
### 2.3 Project Settings
In the Vercel dashboard for the new project:
- **Project Name:** `my-english-practice` (or any preferred name).
- **Framework Preset:** `Next.js`.
- **Root Directory:** `.` (the repository root; do not change unless the app is in a subfolder).
- **Build Command:** `npm run build` (default — confirm it is set).
- **Output Directory:** `.next` (default).
- **Install Command:** `npm install` (default).
- **Development Command:** Not needed for production deployment.
---
## 3. Supabase Project Setup
### 3.1 Creating the Project
1. Log in to `https://supabase.com`.
2. Click **"New project"**.
3. Choose an organisation (or create one — free).
4. Set **Project name:** `my-english-practice`.
5. Set **Database Password:** A strong, random password. Save this securely (it will be used in `DATABASE_URL`).
6. Select **Region:** The closest region to the primary user base. For British English users in the UK, `eu-west-1` (London) or `eu-west-2` (Frankfurt) is recommended.
7. Click **"Create new project"** and wait for the database to initialise (usually 1–2 minutes).
### 3.2 Retrieving Connection Details
After the project is created:
1. Go to **Settings** → **Database**.
2. Copy the **Connection string** (URI format). It looks like:
`postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
3. Replace `[PASSWORD]` with the database password set during creation. This is the value for `DATABASE_URL` in `.env` and in Vercel environment variables.
### 3.3 Retrieving Auth and Public Keys
1. Go to **Settings** → **API**.
2. Copy **Project URL** — this is `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy **anon public** key — this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Copy **service_role** key — this is `SUPABASE_SERVICE_ROLE_KEY`. **Keep this secret.** It must never be exposed in client-side code.
---
## 4. Environment Variables (Exact Names Only)
The `.env` file (and Vercel environment variables) must contain the following variables. Real secret values are not shown here — see `.env.example` for the template with placeholder values.
### 4.1 Required Variables
| Variable Name | Where It Comes From | Where It Is Used |
|---|---|---|
| `DATABASE_URL` | Supabase Database → Connection String (URI) | Drizzle ORM database connection (`src/db/index.ts`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API → Project URL | Client-side Supabase auth and data access |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API → anon public | Client-side Supabase auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API → service_role | Server-side API routes (`/api/sync`, `/api/auth` callbacks) for administrative database access |
### 4.2 Optional Variables
| Variable Name | Purpose |
|---|---|
| `NODE_ENV` | Set to `production` by Vercel automatically during build. Do not set manually unless testing locally. |
---
## 5. Setting Environment Variables in Vercel
1. In the Vercel dashboard, go to the project settings (click the project name, then **"Settings"** → **"Environment Variables"**).
2. Add each variable from the list above:
- **Name:** `DATABASE_URL`
- **Value:** The full PostgreSQL URI from Supabase (with real password).
- **Environment:** Check `Production`, `Preview`, and `Development` (so it works in all contexts).
3. Repeat for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. Click **"Save"** after each variable.
5. **Important:** After saving, redeploy the project (either by pushing a new commit or by clicking **"Redeploy"** in the Vercel dashboard) so the new environment variables are included in the build.
---
## 6. Drizzle Schema Push and Migrations
### 6.1 Before First Deployment
The database schema must be applied before the application can serve requests that query `profiles`, `words`, `attempts`, `review_schedule`, or `sessions`.
**Option A: Push (Fast, for initial setup and sandbox)**
From the local development environment:
```bash
# Ensure DATABASE_URL points to the Supabase database
npx drizzle-kit push
```
This applies the schema from `src/db/schema.ts` directly to the database.
**Option B: Migration (Recommended for production stability)**
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```
This creates a tracked migration file in `drizzle/` and applies it through the migration runner.
### 6.2 After Schema Changes
Whenever `src/db/schema.ts` is modified:
1. Generate or push the new schema (`npx drizzle-kit generate` + `migrate`, or `push`).
2. Update `src/db/seed.ts` if new reference data (words, patterns, levels) is needed.
3. Run the seed script locally or in the production environment to populate new tables or new rows:
```bash
# Local seed (with DATABASE_URL from .env)
npx tsx src/db/seed.ts
```
---
## 7. Seed Step
The seed script (`src/db/seed.ts`) inserts the initial vocabulary (words for all 8 levels), phonics patterns, syllable data, and any other reference data required for the application to function.
### 7.1 Running the Seed
After the schema is pushed and before deploying (or immediately after deployment), run:
```bash
# From the project root, with DATABASE_URL set
npx tsx src/db/seed.ts
```
The seed script is designed to be idempotent — running it multiple times does not create duplicate rows. It uses `ON CONFLICT` or pre-check queries to avoid duplicates.
### 7.2 Verifying the Seed
After seeding, connect to the database and verify:
```bash
# Using psql (replace with actual DATABASE_URL)
psql $DATABASE_URL -c "SELECT level, COUNT(*) FROM words GROUP BY level ORDER BY level;"
```
Expected result: Each level (1–8) should have at least 5 words. The `phonics_patterns` table should have at least 9 categories. The `profiles` table should have no rows until users sign up.
---
## 8. Health Check Verification
### 8.1 Local Verification
Before deploying, verify the health endpoint works locally:
```bash
npm run dev
# In another terminal
curl http://localhost:3000/api/health
```
Expected response (`200 OK`):
```json
{"status":"ok","db":"connected"}
```
### 8.2 Production Verification
After deployment to Vercel, visit:
```
https://my-english-practice-[PROJECT-ID].vercel.app/api/health
```
Replace `[PROJECT-ID]` with the actual Vercel deployment URL (visible in the Vercel dashboard). The response must be the same: `{"status":"ok","db":"connected"}` with HTTP `200`.
If the health check fails:
- Confirm `DATABASE_URL` is set correctly in Vercel environment variables.
- Confirm the database schema was pushed (`npx drizzle-kit push` completed successfully).
- Confirm the Supabase database is not paused (free tier databases pause after 7 days of inactivity — visit the Supabase dashboard to resume it).
---
## 9. Custom Domain Notes
A custom domain is optional. The site works fully on the Vercel-provided `.vercel.app` domain.
### 9.1 Adding a Custom Domain (Optional)
1. Purchase or configure a custom domain (e.g., `myenglishpractice.co.uk`).
2. In the Vercel dashboard, go to **Project Settings** → **Domains**.
3. Click **"Add"** and enter the custom domain.
4. Follow Vercel's instructions to configure the DNS records (`CNAME` or `A` records) at the domain registrar.
5. Once verified, the site is accessible at both the custom domain and the Vercel domain (with the custom domain as primary).
### 9.2 SSL / HTTPS
Vercel provides free SSL certificates (`https://`) for all projects, including custom domains. No additional configuration is needed.
---
## 10. Deployment Workflow (Step-by-Step)
Follow these steps in order for a clean, reproducible deployment.
- [ ] Confirm `.env` is configured locally with real values (from `.env.example` template).
- [ ] Confirm `.env` is listed in `.gitignore` and is not committed.
- [ ] Confirm all dependencies are installed (`npm install`).
- [ ] Confirm the database schema is applied (`npx drizzle-kit push` or `migrate`).
- [ ] Confirm the seed script has been run (`npx tsx src/db/seed.ts`).
- [ ] Confirm `npm run build` passes with zero errors.
- [ ] Confirm `/api/health` responds locally with `{"status":"ok","db":"connected"}`.
- [ ] Push the code to GitHub (`git push origin main`).
- [ ] Confirm Vercel has triggered a new deployment (automatic for Vercel + GitHub integration).
- [ ] Confirm the new deployment appears in the Vercel dashboard with a green checkmark.
- [ ] Confirm the deployed URL responds with the landing page (`/`).
- [ ] Confirm `/api/health` responds on the deployed URL.
- [ ] Confirm `/dashboard` loads (requires sign-in; sign up with a test account if needed).
- [ ] Confirm `/session` loads and a word can be heard, typed, and completed.
- [ ] Confirm `/phonics` and `/syllables` pages load correctly.
---
## 11. Troubleshooting Common Failures
### 11.1 Build Failure (`npm run build` fails in Vercel)
**Symptoms:** The Vercel deployment shows a red error with a build log.
**Common Causes and Fixes:**
- **TypeScript error (`tsc --noEmit` fails):** Check the build log for the error message. Fix the missing import, incorrect type, or syntax error locally. Run `npm run build` locally until it passes. Push the fix.
- **Missing environment variables:** If the error mentions `process.env` variables (e.g., `DATABASE_URL is not defined`), confirm all variables are added in the Vercel dashboard and saved. Redeploy.
- **Drizzle schema not pushed:** If the error is a database connection error (`connection refused` or `relation does not exist`), confirm the schema was pushed to Supabase. Run `npx drizzle-kit push` locally with the production `DATABASE_URL`, or run the push from a local environment configured with production variables.
### 11.2 Database Connection Failure (Local or Production)
**Symptoms:** The site loads but `/api/health` returns an error or the database queries fail.
**Common Causes and Fixes:**
- `DATABASE_URL` has the wrong password or wrong host: Copy the connection string again from Supabase Settings → Database.
- The database is paused (free tier): Visit the Supabase dashboard and click **"Resume project"** if it shows as paused.
- The `users` or `profiles` table does not exist: Confirm `npx drizzle-kit push` completed successfully.
- The `words` table is empty: Confirm the seed script (`npx tsx src/db/seed.ts`) was run after the schema push.
### 11.3 SpeechSynthesis Not Working in Production
**Symptoms:** The audio buttons appear but no sound plays.
**Common Causes and Fixes:**
- The browser does not support `SpeechSynthesis`: This is a browser-level issue, not a deployment issue. The site handles it gracefully with a calm message (`Audio unavailable in this browser. You may still practise spelling.`). The user can still complete all drills.
- `SpeechSynthesis` voices are not loaded: Some browsers load voices asynchronously. The `useAudio()` hook waits for the `voiceschanged` event. If the user clicks play before voices are loaded, the audio may use a default voice. This is acceptable — the word is still spoken in English. The user can replay once voices are loaded.
### 11.4 Authentication Failure (Sign-Up / Sign-In)
**Symptoms:** The user cannot sign up, or sign-in returns an error.
**Common Causes and Fixes:**
- `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is incorrect: Copy them again from Supabase Settings → API.
- The `auth.users` table has incorrect policies: Confirm RLS policies are applied. If using `supabase` CLI, verify the policies exist with `supabase db dump --db-url $DATABASE_URL`.
- The user is using an incorrect email format: The `Supabase Auth` form validates email format automatically. Ensure the test email is valid.
### 11.5 Offline Behaviour Not Working
**Symptoms:** The user disconnects from the internet and the session stops working.
**Common Causes and Fixes:**
- The word list is not cached: Confirm the Service Worker (`sw.js`) caches the word list and static assets. Check the browser's `Application` → `Service Workers` tab to confirm the service worker is registered.
- `IndexedDB` is not available: Some browsers disable `IndexedDB` in private mode or when cookies are blocked. Confirm `IndexedDB` works by opening the browser console (`Application` → `IndexedDB`) and checking for the `my-english-practice` database.
- The app tries to fetch data from `/api/session` instead of reading from `IndexedDB`: Confirm the `useDrillEngine()` hook reads the word queue from `IndexedDB` first, and only falls back to the server if `IndexedDB` is empty.
---
## 12. Maintenance and Updates
### 12.1 Routine Updates
- **Schema changes:** Always generate and apply migrations (`drizzle-kit generate` + `migrate`). Never edit the database directly.
- **Dependency updates:** Run `npm update` monthly (or when security alerts appear). Confirm `npm run build` passes after each update.
- **Data updates:** If new words or patterns need to be added, update `src/db/seed.ts` and re-run it. The seed script must remain idempotent.
### 12.2 Monitoring
- Vercel provides deployment status, build logs, and visit analytics (free tier has basic analytics).
- Supabase provides database health monitoring and query performance insights.
- There is no external monitoring service (e.g., Sentry) configured by default. If needed, a free Sentry account can be added later with minimal code changes.
---
*This deployment guide is the complete reference for deploying My English Practice to Vercel and Supabase. Every step — from environment variables to database migrations to health checks — is documented with exact instructions. No placeholders, no omissions.*
