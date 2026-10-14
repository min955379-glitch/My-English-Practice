import Link from "next/link";
export default function HelpPage() {
  return (
    <article className="page-container legal-page">
      <p className="eyebrow">A little guidance</p>
      <h1>Your practice, explained.</h1>
      <h2>How do I start?</h2>
      <p>
        Choose Practice, select any level, and press Start my practice. The word
        plays at normal speed and then slowly. Type one letter at a time. Spaces
        must also be typed in dictation. Uppercase and lowercase letters are
        accepted equally.
      </p>
      <h2>What happens after a mistake?</h2>
      <p>
        An incorrect letter turns red and stays at the same position. Type again
        to replace it, or use Backspace. Nothing moves forward until that letter
        is correct. After two wrong letters, you can choose the hint ladder:
        slow replay, first-letter help, then syllable support. Hints are
        requested, not forced.
      </p>
      <h2>How are reviews scheduled?</h2>
      <p>
        Missed or assisted words return after intervening items, with a limit on
        repeated retries so a session cannot trap you. They are also saved for
        next-day review. Later independent success extends the interval using
        the repository’s simplified FSRS-style rules. This is an adapted
        scheduling model, not the reference FSRS algorithm. Repeating a word in
        the same session does not count as lasting mastery.
      </p>
      <p>
        Mastery requires three independent successes on separate local dates,
        including a review after at least seven days. All thirteen levels are
        open immediately. Accuracy and mastery never limit access.
      </p>
      <h2>Where does progress go?</h2>
      <p>
        Progress stays in this browser. Export a file in Settings to keep a
        backup or move it to another device. There are no sign-in or sign-up
        screens. Existing authenticated sessions can still use cloud sync.
      </p>
      <h2>Can I practise offline?</h2>
      <p>
        The loaded spelling activity, review logic and on-device saving work
        without a connection. Previously visited pages and static assets are
        cached where service workers are supported. Audio depends on your
        device’s installed voices; network-only voices or microphone recognition
        may not work offline.
      </p>
      <h2>Accessibility statement</h2>
      <p>
        This website aims to support keyboard and screen-reader use with
        semantic headings, visible focus, a skip link, accessible input labels,
        and plain text feedback. Wrong-letter feedback is not communicated by
        colour alone. Reduced-motion preferences are respected, and microphone
        use is optional.
      </p>
      <p>
        Use Tab to reach controls, Enter or Space to activate buttons, and
        Backspace to edit spelling. You can pause the timer or finish early. If
        a feature is difficult to use, report it to the deployment operator or
        the project repository. No independent accessibility certification is
        claimed.
      </p>
      <h2>Audio is not playing</h2>
      <p>
        Press Listen after starting the session; some browsers require a direct
        gesture. Check device volume and choose Female or Male under Voice in
        Settings. If a named voice of your choice is unavailable, the best
        installed British English voice is used. If none is available, install
        an en-GB voice on your device. A standard-English fallback is clearly
        labelled.
      </p>
      <p>
        <Link href="/profile">Open Settings</Link> ·{" "}
        <Link href="/session">Start a session</Link>
      </p>
    </article>
  );
}
