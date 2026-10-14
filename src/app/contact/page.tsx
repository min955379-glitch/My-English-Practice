export default function ContactPage() {
  return (
    <article className="page-container legal-page">
      <p className="eyebrow">We can make it clearer</p>
      <h1>Contact & feedback.</h1>
      <p>
        For technical problems or suggestions, open an issue in the project’s{" "}
        <a
          href="https://github.com/min955379-glitch/My-English-Practice/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub issue tracker
        </a>
        . A GitHub account may be required. This installation does not have a
        contact email or private support form configured.
      </p>
      <h2>When reporting a problem</h2>
      <ul>
        <li>Tell us which page you were using.</li>
        <li>Include your browser and device type.</li>
        <li>Describe what you expected and what happened instead.</li>
        <li>
          Do not post passwords, authentication tokens, microphone recordings or
          progress exports publicly.
        </li>
      </ul>
      <h2>Private account or data enquiries</h2>
      <p>
        Use Settings to export progress or request account deletion. For an
        issue that requires private handling, contact the operator who gave you
        access to your deployed website. Do not put personal information into a
        public issue.
      </p>
    </article>
  );
}
