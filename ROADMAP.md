# My English Practice — Roadmap

## Delivery goal

Build a usable, supportive British English practice website for an adult beginner, starting with a reliable listen-and-spell drill and growing into phonics, spaced repetition, pronunciation practice, and a progress dashboard.

## Guiding constraints

- British English throughout.
- Adult-appropriate vocabulary and tone.
- Free technology only.
- Short, calm feedback; no harsh grades.
- Accessibility from the first interactive phase.

## Phase 0 — Project docs and setup

- [ ] Create the GitHub repository `min955379-glitch/My-English-Practice`.
- [ ] Push `README.md` and `ROADMAP.md`.
- [ ] Initialise the React + TypeScript project with Vite.
- [ ] Choose the styling approach (CSS Modules or Tailwind CSS) and document the decision.
- [ ] Add `.gitignore`, `.env.example`, and basic scripts (`dev`, `build`, `preview`).
- [ ] Confirm the production build runs from a clean install.

**Done when:** the repository builds from a clean install and the docs describe the current setup.

## Phase 1 — MVP: core listen-and-spell drill

- [ ] Implement normal-speed and slow-speed word playback using browser speech synthesis with `en-GB` voices.
- [ ] Build the letter-by-letter spelling interface with keyboard and touch support.
- [ ] Add instant incorrect-letter highlighting with plain-language corrections.
- [ ] Block progress at the incorrect position until the correct letter is entered.
- [ ] Implement the hint ladder after two failed attempts at the same letter position.
- [ ] Add word lists for Levels 1–3 with adult-appropriate vocabulary.
- [ ] Save basic mistake records locally (word, position, hint usage, timestamp).
- [ ] Add a simple session flow: due items, new words, and a short summary.

**Done when:** a learner can complete a full listen-and-spell session for Levels 1–3 with mistakes recorded.

## Phase 2 — Phonics, spaced repetition, and dashboard

- [ ] Add phonics modules for letter sounds, including common digraphs.
- [ ] Add syllable breaking with visible and audible chunks.
- [ ] Add spelling patterns and word families.
- [ ] Implement FSRS-based spaced repetition with a same-session retry queue.
- [ ] Return every mistake later in the session and schedule next-day reviews.
- [ ] Add Supabase authentication and progress synchronisation with row-level security.
- [ ] Build the progress dashboard: first-try accuracy, words mastered, review workload, and common mistake types.
- [ ] Extend word lists to Levels 4–6.

**Done when:** mistakes resurface on schedule, progress syncs across devices, and the dashboard reflects real practice data.

## Phase 3 — Pronunciation, fluency, and dictation

- [ ] Add microphone speak-and-check using the Web Speech API where supported.
- [ ] Show recognition feedback as a supportive hint (“I heard: …”), never a harsh grade.
- [ ] Add listen-and-repeat pronunciation activities.
- [ ] Add short, adult-appropriate reading-aloud passages with fluency support.
- [ ] Add sentence dictation alongside word dictation.
- [ ] Extend word lists to Levels 7–8.

**Done when:** a learner can practise speaking and reading aloud with supportive feedback, and complete sentence dictation.

## Phase 4 — Polish, deployment, and AdSense readiness

- [ ] Polish the interface, loading states, and error messages.
- [ ] Add accessibility review: keyboard navigation, screen readers, and colour contrast.
- [ ] Deploy to free static hosting with automatic deploys from the main branch.
- [ ] Add AdSense-ready pages: about, contact, and privacy policy.
- [ ] Verify British English defaults across the site.
- [ ] Run a full end-to-end test of a daily session.

**Done when:** the site is live, accessible, and ready for real learners and AdSense review.

## Out of scope for now

- Native mobile applications.
- Paid APIs or services.
- Social features or leaderboards.
- Content beyond the planned eight levels.

## Tracking

- A simple task board (for example, GitHub Projects) mirrors the phase checklists.
- Each phase checklist is the source of truth for progress.
- Update this file when scope changes; keep completed tasks checked.
