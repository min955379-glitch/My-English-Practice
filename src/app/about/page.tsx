import Link from "next/link";
export default function AboutPage() {
  return (
    <article className="page-container legal-page">
      <p className="eyebrow">A quieter way to learn</p>
      <h1>About My English Practice.</h1>
      <p>
        My English Practice was made for adults who find English spelling
        difficult and reading aloud slow or effortful. It starts with listening,
        then makes room for one letter, one word and one small pattern at a
        time.
      </p>
      <h2>Useful English, not childish lessons</h2>
      <p>
        The curriculum follows British English and uses words for work, travel,
        money and daily life. Simple vocabulary is presented respectfully. There
        are no public rankings, competitive rewards or pronunciation grades.
      </p>
      <h2>A routine you can return to</h2>
      <p>
        Practise for 15–25 minutes when it suits you. Words that need more
        attention return after other items and in a next-day review. The
        dashboard shows real on-device learning records, with independent recall
        kept separate from assisted completion.
      </p>
      <h2>Free and transparent</h2>
      <p>
        Core practice does not require payment or an account. The source project
        is maintained in the{" "}
        <a
          href="https://github.com/min955379-glitch/My-English-Practice"
          target="_blank"
          rel="noopener noreferrer"
        >
          My English Practice repository
        </a>
        . Browser audio and microphone features depend on your device. Existing
        authenticated sessions can still sync where Supabase is configured;
        there are no sign-in or sign-up screens. All thirteen levels are open.
      </p>
      <p>
        <Link href="/session">Begin your practice</Link> ·{" "}
        <Link href="/help">Read the practice guide</Link>
      </p>
    </article>
  );
}
