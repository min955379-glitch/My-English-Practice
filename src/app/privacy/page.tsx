import Link from "next/link";
export default function PrivacyPage() {
  return (
    <article className="page-container legal-page">
      <p className="eyebrow">A clear view of your data</p>
      <h1>Privacy, without the small print.</h1>
      <p>
        My English Practice is designed for private, self-paced learning. This
        policy describes the features implemented in this website. Last updated:
        14 October 2026.
      </p>
      <h2>On-device progress</h2>
      <p>
        In guest mode, spelling attempts, sessions, mistakes, review schedules
        and preferences are stored in your browser’s IndexedDB. This data is not
        sent to the website’s database unless an existing authenticated session
        uses cloud sync. Clearing browser data can remove it. Export a backup
        from Settings if you want to keep a copy. A small, temporary
        browser-storage checkpoint protects unfinished letter drafts during a
        reload.
      </p>
      <h2>Existing authenticated sessions</h2>
      <p>
        Sign-in and sign-up screens are not provided. Previously authenticated
        sessions, when Supabase is configured, continue to use Supabase
        Authentication. Supabase processes your email address and authentication
        information. Signed-in progress is stored separately from guest
        progress. Cloud sync sends attempts, session information, review
        schedules and preferences to the configured Supabase PostgreSQL
        database.
      </p>
      <p>
        Authentication tokens are stored by the Supabase browser client. Do not
        stay signed in on a shared device. Private database rows have ownership
        policies. Administrative database credentials are restricted to server
        configuration.
      </p>
      <h2>Microphone and audio</h2>
      <p>
        The microphone starts only when you consent and press Speak and check.
        Your browser’s recognition provider may receive your speech; processing
        is not guaranteed to remain on your device. This website does not store
        microphone recordings or transcripts in the progress database.
        Recognition is optional and does not grade pronunciation.
      </p>
      <p>
        Speech synthesis uses voices supplied by your browser or device. Some
        voices may need a network connection. Inter is fetched during the
        application build and self-hosted by Next.js at runtime.
      </p>
      <h2>Cookies, caching and advertising</h2>
      <p>
        The application uses browser storage for progress, authentication and
        cached public assets. A service worker caches public pages and static
        assets for offline use; it does not cache account API responses. No
        advertising or analytics SDK is currently installed. There are no
        non-essential tracking cookies to accept. Any later advertising
        integration requires this policy and applicable consent controls to be
        updated first.
      </p>
      <h2>Retention and deletion</h2>
      <p>
        Local data remains until you clear it or your browser removes it.
        Account data remains until you delete the account. Settings provides
        export, import, local reset and, when server administration is
        configured, permanent account deletion. Deleting the Supabase Auth user
        cascades through the application’s associated database records. Local
        copies on other devices must be cleared on those devices.
      </p>
      <h2>Infrastructure and enquiries</h2>
      <p>
        Hosting and authentication providers may retain operational logs
        according to their own policies. This installation has no public contact
        email configured. For a privacy enquiry, contact the operator who
        supplied your deployment, or open an issue in the project’s{" "}
        <a
          href="https://github.com/min955379-glitch/My-English-Practice/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>
        . Do not include passwords, tokens or sensitive progress exports in
        public issues.
      </p>
      <p>
        <Link href="/profile">Manage your data in Settings</Link>
      </p>
    </article>
  );
}
