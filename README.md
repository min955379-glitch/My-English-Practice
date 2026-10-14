# My English Practice

A British English spelling and pronunciation practice website for adult beginners who find spelling difficult and cannot yet read English smoothly.

**Repository:** [min955379-glitch/My-English-Practice](https://github.com/min955379-glitch/My-English-Practice)

## Why this project exists

Many English-learning tools assume that learners can already read instructions, recognise written words, and spell independently. This creates a barrier for adults who need to build those skills first.

My English Practice starts with listening, then guides the learner through spelling one letter at a time. Immediate, calm corrections prevent repeated guessing. Short explanations, useful vocabulary, and repeated practice help the learner connect sounds, letters, and meaning without childish content or punitive grades.

The goal is steady, measurable improvement through **15–25 minutes of daily practice**, not perfect performance on the first attempt.

## Learning principles

- Use British English spelling and request `en-GB` speech voices.
- Choose adult-appropriate vocabulary about work, money, travel, and daily life.
- Keep instructions short, readable, and available as audio.
- Introduce one difficulty at a time; do not assume fluent reading.
- Treat mistakes as information about what to practise next.
- Keep recognition feedback supportive: **“I heard: …”**, not a harsh pronunciation grade.
- Make practice accessible by keyboard, touch, and assistive technology.

## Planned features

### Listening and spelling

- Normal-speed and slow-speed word playback, with replay controls.
- Letter-by-letter spelling with an accessible text-entry interface.
- Instant red highlighting for an incorrect letter, accompanied by plain text such as **“Wrong letter — it should be O.”**
- Progress blocked at the incorrect position until the correct letter is entered.
- A hint ladder after two failed attempts at the same letter position.
- Whole-word repetition and a short meaning or practical example after completion.
- Word dictation, followed later by sentence dictation.

### Sounds and reading

- Phonics modules for letter–sound relationships, including common digraphs.
- Syllable breaking with visible and audible chunks.
- Spelling patterns and word families.
- Listen-and-repeat pronunciation activities.
- Optional microphone speak-and-check where browser recognition is supported.
- Short, adult-appropriate reading-aloud passages.

### Review and progress

- Eight levels, from simple CVC words such as **cat** to harder words such as **business**.
- FSRS-based spaced repetition, combined with a same-session retry queue.
- Every spelling mistake returns later in the session and enters a next-day review path; subsequent reviews are spaced according to performance.
- Mastery earned through successful reviews on separate days, not repeated success in one sitting.
- A dashboard showing first-try accuracy, words mastered, review workload, and common mistake types.
- Supabase accounts and progress synchronisation, protected by row-level security.
- Guided daily sessions lasting approximately 15–25 minutes.

## How the core drill works

1. **Start a session.** The learner receives due reviews and a small selection of new words appropriate to their level.
2. **Hear the word.** Play it at normal speed, then at a slower rate. Keep replay buttons available. Do not show the complete spelling before the attempt.
3. **Enter one letter at a time.** For example, the learner builds **P-E-R-S-O-N** through six letter positions; the hyphens are display separators, not required input.
4. **Check immediately.** Correct letters are accepted. An incorrect letter turns red and receives a plain correction. The current position stays active until it is correct.
5. **Offer help after two failed tries.** Use progressively stronger support: replay the word, isolate the relevant sound or syllable, then show and speak the target letter. Because the correction already reveals the letter, assisted completion does not count as first-try success.
6. **Complete and reinforce.** Show the complete word, replay it, and provide a brief meaning or everyday example. Offer an optional repeat-aloud attempt.
7. **Record the outcome.** Save the first attempt, errors by position, hints used, and completion. Backspace, navigation, and empty input are not mistakes.
8. **Return to mistakes.** Reinsert missed words after several intervening items. Keep unresolved reviews available if the session ends early, and schedule a next-day review before longer intervals.

Input is case-insensitive. Paste, autofill, and multi-character input must not bypass checking; process each letter in order. A whole-word reveal or hint remains available so the learner cannot become permanently stuck.

## Levels and vocabulary

These are curriculum bands, not formal CEFR certifications. Final placement depends on reviewed word difficulty, spelling patterns, and learner performance.

| Level | Main focus | Example words |
| --- | --- | --- |
| 1 | Simple consonant–vowel–consonant words | cat, cup, bus |
| 2 | Common consonant blends and digraphs | shop, bank, desk |
| 3 | Common long-vowel patterns and silent e | name, time, rain |
| 4 | Frequent vowel teams and r-influenced vowels | team, train, park |
| 5 | Practical two-syllable words | hotel, ticket, payment |
| 6 | Common endings, prefixes, and word families | working, helpful, return |
| 7 | Less predictable spellings and longer words | business, journey, answer |
| 8 | Revision and mixed challenge across bands | mixed |

## Technology stack

| Area | Choice | Notes |
| --- | --- | --- |
| Frontend | React + TypeScript | Built with Vite. |
| Styling | CSS Modules or Tailwind CSS | Decide in Phase 0; keep the choice consistent. |
| Accounts and data | Supabase | Authentication, Postgres, and row-level security. |
| Spaced repetition | FSRS | Implemented in TypeScript; no paid service required. |
| Audio (initial) | Browser speech synthesis | Normal and slow playback via `en-GB` voices. |
| Audio (later) | Pre-generated audio files | Replaces synthesis for consistency. |
| Microphone | Web Speech API | Used only where supported; feedback shown as “I heard: …”. |
| Hosting | Free static hosting | For example, Vercel, Netlify, or Cloudflare Pages. |
| Source control | GitHub | Repository: `min955379-glitch/My-English-Practice`. |

## Project structure

The repository starts with documentation. Application code is added in later phases.

```text
My-English-Practice/
├── README.md
├── ROADMAP.md
├── .gitignore
├── src/                # Added in Phase 1
├── public/             # Added in Phase 1
└── supabase/           # Added in Phase 2
```

## Running locally

1. Install [Node.js](https://nodejs.org/) 20 or later.
2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/min955379-glitch/My-English-Practice.git
   cd My-English-Practice
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values below.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes, from Phase 2 | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Yes, from Phase 2 | Supabase anonymous public key. |

Only public, non-secret values belong in the frontend environment. Service-role keys must never be exposed in the browser.

## Deployment plan

- Host the built site on a free static host (Vercel, Netlify, or Cloudflare Pages).
- Connect the GitHub repository so pushes to the main branch deploy automatically.
- Set the environment variables in the hosting dashboard.
- Confirm British English defaults: `en-GB` speech voices, British spellings, and date formats.
- Prepare AdSense-ready pages (about, contact, privacy policy) during Phase 4 before applying.

## Project status

### Current status

- [x] Project documentation drafted (`README.md`, `ROADMAP.md`).
- [ ] Phase 0 setup completed.
- [ ] MVP core drill implemented.

### Next steps

- [ ] Create the GitHub repository `min955379-glitch/My-English-Practice` and push these files.
- [ ] Connect the repository to the Phase 0 setup checklist in `ROADMAP.md`.
