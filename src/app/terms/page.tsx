import Link from "next/link";
export default function TermsPage() {
  return (
    <article className="page-container legal-page">
      <p className="eyebrow">A supportive place to practise</p>
      <h1>Terms of use.</h1>
      <p>
        My English Practice is a free, self-paced spelling and pronunciation
        practice tool for adults. Last updated: 14 October 2026.
      </p>
      <h2>What this tool offers</h2>
      <p>
        It provides curated British English vocabulary, guided spelling, sound
        patterns, reading passages and scheduled review. Its internal levels are
        learning bands, not accredited qualifications or formal CEFR
        assessments.
      </p>
      <h2>Practice, not a professional assessment</h2>
      <p>
        Speech recognition is a transcription hint, not a pronunciation grade.
        The review system uses the adapted scheduling rules in the project
        specification, not a clinically validated assessment. The website is not
        speech therapy and does not guarantee a particular learning outcome.
      </p>
      <h2>Accounts and responsible use</h2>
      <p>
        Keep account credentials private. Use the website for personal learning
        and do not attempt to access another person’s records, misuse the
        microphone, or disrupt the service.
      </p>
      <h2>Availability and backups</h2>
      <p>
        Browser features and free hosting services may change or become
        unavailable. Offline practice depends on previously loaded content and
        available device voices. Local progress can be lost if browser storage
        is cleared. Export backups from Settings.
      </p>
      <h2>Changes and enquiries</h2>
      <p>
        The operator should review these terms before public deployment. Report
        technical issues through the project repository without sharing private
        information. Advertising is not currently enabled.
      </p>
      <p>
        <Link href="/privacy">Read the privacy policy</Link>
      </p>
    </article>
  );
}
