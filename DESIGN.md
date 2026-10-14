# Design System (DESIGN.md)
# My English Practice
| Field | Value |
|---|---|
| Product | My English Practice |
| Design Philosophy | Calm, supportive, adult-focused, private, non-competitive |
| Colour Family | Slate / Stone / Teal / Red-500 (errors only) |
| Typography | System UI / Inter (fallback) — clean, highly legible, no decorative fonts |
| Last Updated | 2026-01-15 |
---
## 1. Design Philosophy
Every visual decision in My English Practice serves one purpose: to help an adult beginner with weak English spelling feel calm, safe, and in control. There are no bright flashing animations, no alarm sounds, no red crosses, no public leaderboards, no emojis anywhere, and no competitive elements. The design is intentionally quiet. The user is not being tested; they are being supported.
The design treats the user as an adult who knows what they need. There are no cartoon characters, no gamified badges with stars, and no silly sound effects. The only colour used for negative feedback is red (`#ef4444`), and it appears only on the single wrong letter being typed — never as an icon, never as a background, and never in an alarming animation.
---
## 2. Calm Colour Palette
All colours are defined in `src/app/globals.css` as Tailwind v4 custom theme variables.
### 2.1 Primary Palette
| Token | Hex | Usage |
|---|---|---|
| `calm-background` | `#f8f9fb` | Page background. A very light cool grey that does not compete with content. |
| `calm-surface` | `#ffffff` | Cards, modals, input containers. Pure white for maximum legibility. |
| `calm-text-primary` | `#0f172a` | Main headings and body text (`slate-950`). High contrast on white surfaces. |
| `calm-text-secondary` | `#475569` | Subheadings, descriptions, hints (`slate-600`). |
| `calm-text-muted` | `#94a3b8` | Captions, timestamps, placeholder text (`slate-400`). |
| `calm-teal` | `#0ea5e9` | Success states, completed words, active focus borders, links, positive trends in the dashboard. |
| `calm-red` | `#ef4444` | **Only** the wrong letter in the input field. Never used for backgrounds, borders of cards, or icons. |
| `calm-stone` | `#78716c` | Neutral borders, dividers, inactive states (`stone-500`). |
### 2.2 Secondary / Accent Palette
| Token | Hex | Usage |
|---|---|---|
| `calm-teal-dark` | `#0369a1` | Hover state for teal links and buttons. |
| `calm-teal-light` | `#e0f7fa` | Very subtle teal background for hint ladder cards or highlighted syllables. |
| `calm-stone-light` | `#f5f5f4` | Subtle background for sections inside the dashboard or phonics grid (`stone-100`). |
| `calm-stone-border` | `#e7e5e4` | Card borders and divider lines (`stone-200`). |
### 2.3 What Each Colour Is Used For
- **Calm Background (`#f8f9fb`):** Every page that is not the dashboard or a card. Keeps the site from feeling stark white everywhere.
- **Calm Surface (`#ffffff`):** Drill cards, metric cards on the dashboard, phonics cards, syllable display boxes, and all modal/dialog surfaces.
- **Calm Text Primary (`#0f172a`):** All headings (`h1`, `h2`, `h3`), body paragraphs, word display text, and button labels.
- **Calm Text Secondary (`#475569`):** Descriptions under headings, session statistics labels, hint ladder instructions, and footer links.
- **Calm Text Muted (`#94a3b8`):** Small captions (e.g., "15 minutes ago"), disabled button text, and placeholder text in input fields.
- **Calm Teal (`#0ea5e9`):** Completed word confirmation colour (brief 1.5-second display), focus ring on the letter input, active navigation links, progress bar fills, positive metric arrows, and the microphone button active state.
- **Calm Red (`#ef4444`):** **Only** the single incorrect letter inside the hidden-input visual representation in the drill. It is never used for any other purpose — no error banners, no alert boxes, no icons, no borders on cards. When a wrong letter appears, it turns red at the same index position and remains there until corrected.
- **Calm Stone (`#78716c`):** Inactive tab states, disabled buttons, and the subtle divider lines between sections.
- **Calm Stone Light (`#f5f5f4`):** Background for the phonics grid cards, syllable split display boxes, and the footer section.
- **Calm Stone Border (`#e7e5e4`):** All card borders (`border-stone-200`), divider rules (`border-b`), and the subtle outline of the letter input container.
---
## 3. Typography
### 3.1 Font Stack
The site uses a system font stack with Inter as the preferred font (loaded via Google Fonts or self-hosted, but always with a system fallback). There are no decorative or script fonts anywhere.
```
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```
### 3.2 Scale and Weights
| Role | Size (rem) | Weight | Line Height | Colour | Usage |
|---|---|---|---|---|---|
| `h1` | `2.5rem` (40px) | `600` | `1.1` | `calm-text-primary` | Page titles (`My English Practice`, session welcome) |
| `h2` | `1.875rem` (30px) | `600` | `1.15` | `calm-text-primary` | Section titles (`Your Progress`, `Phonics Patterns`) |
| `h3` | `1.25rem` (20px) | `600` | `1.2` | `calm-text-primary` | Card titles, pattern names |
| `body` | `1rem` (16px) | `400` | `1.6` | `calm-text-secondary` | All paragraphs, descriptions, instructions |
| `body-small` | `0.875rem` (14px) | `400` | `1.5` | `calm-text-muted` | Captions, timestamps, footnotes |
| `label` | `0.75rem` (12px) | `500` | `1.3` | `calm-text-muted` | Form labels, metric card sub-labels (uppercase tracking optional) |
| `input-display` | `2.25rem` (36px) | `400` | `1.0` | `calm-text-primary` | The visual word being typed in the drill |
| `button` | `1rem` (16px) | `500` | `1.4` | `calm-surface` | All button text |
### 3.3 Letter Spacing
- `tracking-tight` (`-0.025em`) for `h1` at large sizes.
- `tracking-normal` for body text.
- `tracking-wide` (`0.05em`) only for uppercase labels (`label` role) — never for headings.
### 3.4 Text Alignment
- Left-aligned for all body text and headings.
- Center-aligned only for the brand title on the landing page and for metric values inside cards.
- Never justified (justified text creates irregular spacing and reduces readability for beginners).
---
## 4. Spacing and Layout Rules
### 4.1 Spacing Scale
All spacing uses a consistent scale based on `0.25rem` (4px) increments.
| Token | Value | Usage |
|---|---|---|
| `spacing-0.5` | `0.125rem` (2px) | Minimal gaps between inline elements |
| `spacing-1` | `0.25rem` (4px) | Tight component padding, small gaps |
| `spacing-2` | `0.5rem` (8px) | Default gap between related elements |
| `spacing-3` | `0.75rem` (12px) | Internal padding for small cards |
| `spacing-4` | `1rem` (16px) | Standard gap, default component padding |
| `spacing-6` | `1.5rem` (24px) | Section gaps, larger card padding |
| `spacing-8` | `2rem` (32px) | Major section breaks |
| `spacing-12` | `3rem` (48px) | Page-level spacing, header/footer padding |
| `spacing-16` | `4rem` (64px) | Large landing page sections |
### 4.2 Layout Container
- Maximum content width: `max-w-5xl` (`64rem`/`1024px`) for the main content area.
- Side padding: `px-6` (`1.5rem`) on mobile, `px-8` (`2rem`) on desktop.
- The drill card (`DrillCard`) has a fixed maximum width of `max-w-2xl` (`42rem`/`672px`) to keep the input centred and easy to read.
### 4.3 Grid System
- The phonics grid uses a responsive 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with equal-height cards.
- The dashboard metric cards use a responsive 2-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) with consistent gap (`gap-4`).
- The syllable split display uses a single-row flex layout (`flex gap-4 justify-center`) that wraps on narrow screens.
---
## 5. Component Styles
### 5.1 Drill Card (`DrillCard`)
The drill card is the most important component. It must feel like a calm, focused workspace — not a game, not a test.
- **Container:** White background (`bg-calm-surface`), rounded corners (`rounded-3xl`), subtle border (`border border-calm-stone-border`), shadow (`shadow-[0_24px_60px_rgba(16,24,40,0.08)]`).
- **Internal Layout:** Vertical flex column, centred content (`items-center`), generous padding (`p-10` on desktop, `p-6` on mobile).
- **Height:** Auto — never fixed height, to accommodate hints and messages without clipping.
- **Animation:** No entrance animation (no slide, no fade-in for the card itself). The only motion is the brief colour change when a word completes (1.5-second calm teal confirmation).
### 5.2 Letter Input (`LetterInput`)
The input is the interactive heart of the product. Its design must be invisible except when needed.
- **Hidden Input:** A native `<input type="text" maxLength="1">` is placed with `opacity-0`, `position-absolute`, and full size over the visual representation. It captures keyboard events natively.
- **Visual Word:** Each letter position is a `<span>` with fixed width (`w-10` to `w-12` depending on screen size), centred text (`text-center`), and a subtle bottom border (`border-b-2 border-calm-stone-border`) for the current position.
- **Neutral State:** `text-calm-text-primary` (`#0f172a`), `font-normal`.
- **Correct State:** Same colour, no change needed — the calm design does not celebrate individual correct letters loudly.
- **Red Wrong-Letter State (`calm-red`, `#ef4444`):** The span at the incorrect index turns red (`text-calm-red`), maintains the same font weight (`font-medium` for slightly stronger visibility without shouting), and stays at the same index. The bottom border of the current position also turns red (`border-calm-red`) to reinforce the focus.
- **Input Container:** A rounded rectangle (`rounded-xl`) with `bg-calm-stone-light` (`#f5f5f4`) and `border border-calm-stone-border`. The word is displayed inside this container.
- **Placeholder:** When no letters have been typed, the container shows a subtle placeholder text (`_` or the target word in muted grey `text-calm-text-muted`) to indicate where typing begins.
**Critical Design Rule:** The red letter is never accompanied by a red icon, red background, red border on the card, or any flashing. It is a single red letter in an otherwise calm white space. That is the only negative visual cue in the entire product.
### 5.3 Buttons
- **Primary Button (`Button` component):** Background `calm-teal` (`#0ea5e9`), white text (`#ffffff`), rounded (`rounded-full` for pill shape or `rounded-xl` for rounded corners), padding (`px-6 py-3`), weight (`font-medium`). Hover state: `calm-teal-dark` (`#0369a1`). Focus state: `outline-2 outline-offset-2 outline-calm-teal`.
- **Secondary Button:** Background `calm-stone-light` (`#f5f5f4`), text `calm-text-secondary` (`#475569`), same padding and radius. Hover state: slightly darker (`#e7e5e4`). Used for "Slow Replay" and hint ladder level buttons.
- **Hint Ladder Button:** Smaller (`px-4 py-2`), secondary style, with a calm label like "Replay with emphasis" or "Show first letter". No arrows pointing to the button, no pulsing glow.
- **Disabled Button:** `opacity-50`, `cursor-not-allowed`. No colour change — it simply becomes less prominent.
### 5.4 Hint Ladder (`HintLadder`)
The hint ladder activates only after 2 consecutive failures on the same word. It must feel like a gentle hand, not an automatic rescue.
- **Container:** A small card (`bg-calm-stone-light`) with a subtle top border (`border-t-2 border-calm-teal`) indicating support is available.
- **Title:** Small label (`label` role, uppercase, tracking-wide): "A little help" or "Hint ladder".
- **Levels:** Three buttons stacked vertically (`flex-col gap-2`), each labelled with calm, descriptive text:
1. "Listen again with emphasis"
2. "Show the first letter"
3. "Break into syllables"
- **State:** Each button starts in the secondary style. After the user clicks it, it changes to a calm disabled state (`opacity-60`) with a checkmark icon (`✓`) indicating it was used — never a red cross.
- **Animation:** None. The ladder appears with a very subtle fade (`transition-opacity duration-300`) — not a slide, not a bounce.
### 5.5 Dashboard Cards (`MetricCard`, `LevelProgressRing`)
- **Metric Card:** White background (`bg-calm-surface`), rounded (`rounded-2xl`), subtle shadow (`shadow-sm`), border (`border border-calm-stone-border`). Internal layout: label at top (`body-small`, `calm-text-muted`), value in the middle (`text-3xl`, `font-semibold`, `calm-text-primary`), trend arrow at bottom (`calm-teal` for positive, `calm-stone` for neutral). No red values on the dashboard — mistakes are shown as a neutral count.
- **Level Progress Ring (`LevelProgressRing`):** A native SVG circle (`<circle>`) with `stroke-dasharray` animation. The ring uses `calm-teal` for completed percentage and `calm-stone-border` for the remaining track. No animations faster than `transition-all duration-700 ease-out`.
- **FSRS Review List:** A clean table with rows (`border-b border-calm-stone-border`), word in primary text, interval in muted text, due date in muted text. No red rows — overdue items are shown with a calm `calm-teal` dot indicator, not a red warning.
### 5.6 Audio Player (`AudioPlayer`)
- **Play Button:** Circular (`rounded-full`), `calm-teal` background, white play icon (`▶` SVG, not emoji). Size: `w-12 h-12` (48px) for the main normal-speed button; `w-10 h-10` (40px) for slow/replay buttons.
- **Slow Indicator:** A small label below the slow button: `body-small`, `calm-text-muted`: "Slow speed".
- **Replay:** The replay button is a small text link (`calm-text-secondary`, `underline` on hover) positioned to the right of the play buttons — never a separate large button that competes with the main action.
- **Disabled State:** If `SpeechSynthesis` is unavailable, the play button shows a calm muted state (`bg-calm-stone-light`, `calm-stone` icon) with a tooltip explaining the limitation.
### 5.7 Feedback Banner (`FeedbackBanner`)
- **Position:** Directly below the letter input container, never overlapping it.
- **Style:** Small text (`body-small`), `calm-text-secondary`, no background colour change (it sits on the white card background). When a wrong letter is typed, the banner text updates to: "Not quite. Try that letter again."
- **Animation:** A very subtle opacity transition (`transition-opacity duration-200`) — the message appears gently, not abruptly. No slide-in from the top or bottom.
- **ARIA:** `aria-live="polite"` so screen readers announce the message calmly without interrupting the user.
---
## 6. Responsive Breakpoints
| Breakpoint | Width | Usage |
|---|---|---|
| Mobile (`sm` default) | `< 640px` | Single column layout. Drill card padding reduced (`p-6`). Font sizes slightly smaller (`h1` at `2rem`). Letter input spans reduced (`w-8`). |
| Small (`sm`) | `>= 640px` | Two-column dashboard metric cards. Slightly larger spacing. |
| Medium (`md`) | `>= 768px` | Phonics grid becomes 2 columns. Drill card reaches standard padding (`p-10`). |
| Large (`lg`) | `>= 1024px` | Phonics grid becomes 3 columns. Main content reaches `max-w-5xl`. |
| Extra Large (`xl`) | `>= 1280px` | Maximum comfort width. No layout changes — the content stays centred with generous side margins. |
### Responsive Rules
- The drill card never shrinks below `320px` width (minimum readable size for the word display).
- The letter input container wraps on very small screens: if the word is longer than 10 characters, it allows horizontal scrolling (`overflow-x-auto`) within the container rather than shrinking the letter spans to unreadable sizes.
- The microphone button (`MicrophoneCheck`) is hidden on screens narrower than `480px` if there is not enough horizontal space, but it remains accessible via a vertical stack below the word display.
---
## 7. Accessibility Rules
### 7.1 Contrast
Every text element must meet `WCAG AA` minimum contrast ratios:
- Normal text (`16px` or larger, weight `400`): minimum `4.5:1` against its background.
- Large text (`24px` or larger, or `19px` bold): minimum `3:1` against its background.
Verified pairs:
- `calm-text-primary` (`#0f172a`) on `calm-surface` (`#ffffff`): ratio `~16.5:1` — exceeds AA.
- `calm-text-secondary` (`#475569`) on `calm-surface` (`#ffffff`): ratio `~7.2:1` — exceeds AA.
- `calm-text-muted` (`#94a3b8`) on `calm-surface` (`#ffffff`): ratio `~2.9:1` — **does not meet AA for normal text**. This is acceptable because muted text is used only for captions and non-essential labels (`label` role), not for body content or interactive elements. Interactive elements (buttons, links) never use `calm-text-muted` as their primary text colour.
- `calm-red` (`#ef4444`) on `calm-surface` (`#ffffff`): ratio `~4.6:1` — meets AA for the red wrong-letter state.
- `calm-teal` (`#0ea5e9`) on `calm-surface` (`#ffffff`): ratio `~3.1:1` — does not meet AA for normal text, but `calm-teal` is only used for interactive focus rings (`outline`), completed word states (brief, non-essential), and progress fills. It is never used as body text colour.
### 7.2 Focus States
- Every interactive element (`button`, `input`, `a`) must have a visible focus indicator.
- The focus style is a `2px` solid outline (`outline-2 outline-offset-2`) in `calm-teal` (`#0ea5e9`). It is never removed (`outline-none`) without a replacement.
- Focus order follows the visual order (`Tab` moves left-to-right, top-to-bottom).
### 7.3 Keyboard Navigation
- The `LetterInput` hidden input captures all typing without requiring `Tab` focus for each letter — the user types naturally.
- The replay button (`AudioPlayer`) must be reachable with `Tab` and activated with `Enter` or `Space`.
- The hint ladder buttons (`HintLadder`) must be reachable with `Tab` and selected with `Enter`.
- The microphone button (`MicrophoneCheck`) must have a `Tab` focus and an `Enter` activation.
- `Escape` exits the current session (with a calm confirmation dialog: "Leave this session? Your progress is saved.").
### 7.4 ARIA and Screen Readers
- `FeedbackBanner`: `aria-live="polite"`, `role="status"`. The message updates when a wrong letter is typed.
- `WordDisplay`: `aria-label` describing the target word and current progress (e.g., "Target: hello. Typed: he_.").
- `DrillCard`: `aria-label="Spelling practice: [word]"`.
- `AudioPlayer`: `aria-label` on play buttons: "Play normal speed" and "Play slow speed".
- `MicrophoneCheck`: `aria-label` updates to describe the listening state: "Listening...", "Heard: cat. You said: close!", etc.
- All images and icons use `alt` text or `aria-label`. No decorative icons are hidden from screen readers incorrectly — only purely decorative SVG shapes have `aria-hidden="true"`.
---
## 8. What Must NEVER Appear
These rules are non-negotiable. Any violation of these rules breaks the core design philosophy and must be corrected before any code is merged.
### 8.1 No Emojis — Icons / SVG Only
- There are **no emojis** (`😀`, `🎉`, `✅`, `❌`, `⭐`, `🔥`, `💪`) anywhere in the website — not in UI text, not in button labels, not in messages, not in metadata, not in code comments that might be exposed to users.
- All visual symbols use inline SVG (`<svg>`) with `aria-hidden="true"` (for decorative shapes) or `aria-label` (for meaningful icons like play buttons, checkmarks, or microphone icons).
- Example: The replay button uses an SVG play icon (`▶`), not the emoji `▶` or any Unicode play symbol.
### 8.2 No Flashing Animations
- There are no animations faster than `300ms` duration.
- There are no `keyframes` animations that change colour rapidly (no blinking, no flashing red, no pulsing red borders).
- The only animation on error is the instant colour change of the letter span (`transition-colors duration-150`) — not a flash, just a calm colour shift.
- The hint ladder appears with a subtle opacity transition (`duration-300`), never a slide or scale animation.
### 8.3 No Alarm Styling
- There are no red backgrounds, no red borders on cards, no red banners with alarm icons.
- The only red element in the product is the single wrong letter inside the input display.
- There are no error sounds (`beep`, `buzz`, `alert` tone).
- There are no failure icons (`✗`, `⚠`, `🚫`).
### 8.4 No Competitive Elements
- There are no scores (`Score: 850`), no points (`+10 points`), no stars (`⭐⭐⭐`), no badges (`Spelling Master`), no streak flames (`🔥 5-day streak` — the streak is shown as a calm number, not a flame icon).
- There are no leaderboards (`Top 10 this week`), no public profiles (`User #42: 95%`), no comparison charts (`You vs. other learners`).
- The dashboard shows the user's own metrics only. There is no social or competitive data.
### 8.5 No Bright, Saturated Colours Outside the Palette
- There are no bright pinks, neon greens, bright purples, or high-saturation yellows.
- All colours must come from the calm palette (`slate`, `stone`, `teal`, `red-500`). Any new colour must be approved by referencing this document.
- Background gradients must use only calm palette colours with very low saturation stops (`from-slate-50` to `slate-100`, or `from-stone-50` to `stone-100`). No rainbow or multi-colour gradients.
---
## 9. Design References and Assets
### 9.1 SVG Icons (All Custom, No Emoji Substitutes)
Every icon in the site is a custom inline SVG with a consistent stroke width (`2px`) and colour (`currentColor` or `calm-text-secondary`).
| Icon | SVG Description | Usage |
|---|---|---|
| Play | Triangle pointing right, `w-5 h-5` | `AudioPlayer` play buttons |
| Replay / Replay Arrow | Curved arrow pointing left with a circle, `w-4 h-4` | Replay button |
| Microphone | Microphone shape, `w-5 h-5` | `MicrophoneCheck` button |
| Check / Done | Simple checkmark (`✓` path, not the emoji), `w-4 h-4` | Completed word confirmation, hint ladder used state |
| Syllable Split | Two small dots with a line (`··`), `w-4 h-4` | `SyllablesPage` indicator |
| Arrow Right (Navigation) | Thin arrow, `w-4 h-4` | Navigation links and links within cards |
| Menu / Hamburger | Three horizontal lines, `w-5 h-5` | Mobile navigation toggle |
### 9.2 Image Assets
- The site uses **no stock photography**. Any visual content is either pure CSS (`gradients`, `shapes`) or simple geometric SVG illustrations.
- If an image is required for branding or accessibility, it must be a calm, muted illustration (not a photograph) with high contrast and no text embedded in the image.
---
*This design system is the single source of truth for the visual identity of My English Practice. Every component, every colour, every spacing value, and every interaction must align with this document. Any deviation must be documented with a justification and approved before merge.*
