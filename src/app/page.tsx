import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { shortLevelName, levels, words } from "@/lib/curriculum";
const features: {
  icon: IconName;
  title: string;
  copy: string;
  href: string;
  link: string;
}[] = [
  {
    icon: "headphones",
    title: "Hear it. Spell it.",
    copy: "Normal speed, then slow. Build each word one letter at a time, with a little help along the way.",
    href: "/session",
    link: "Listen & spell",
  },
  {
    icon: "book",
    title: "Make sense of sounds.",
    copy: "Notice phonics, syllables and spelling patterns. Find the small connections that make words feel easier.",
    href: "/phonics",
    link: "Explore phonics",
  },
  {
    icon: "repeat",
    title: "Let learning stay with you.",
    copy: "Tricky words return later and tomorrow. Your practice adapts as words become more familiar.",
    href: "/dashboard",
    link: "See your progress",
  },
];
export default function HomePage() {
  return (
    <>
      <section className="home-hero page-container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            British English. Your own pace.
          </p>
          <h1>
            A little practice.
            <br />A little more
            <br />
            <em>confidence.</em>
          </h1>
          <p className="hero-description">
            Listen to a word. Spell it one letter at a time.
            <br className="desktop-break" /> Build your English with calm,
            everyday practice —<br className="desktop-break" /> and gentle help
            whenever you need it.
          </p>
          <div className="hero-actions">
            <Link href="/session" className="button button-primary hero-cta">
              Start practising <Icon name="arrow" />
            </Link>
            <Link href="/phonics" className="hero-secondary">
              Explore the sounds <Icon name="chevron" width={16} />
            </Link>
          </div>
          <div className="hero-assurance">
            <span>
              <Icon name="clock" width={16} />
              15–25 minutes a day
            </span>
            <span>
              <Icon name="lock" width={16} />
              Private & self-paced
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="practice-preview">
            <div className="preview-top">
              <span className="preview-label">
                <span /> YOUR PRACTICE SPACE
              </span>
              <span className="preview-level">Level 1</span>
            </div>
            <div className="preview-audio">
              <Icon name="volume" width={29} height={29} />
            </div>
            <h2>Listen. Take your time.</h2>
            <p>A familiar word, one letter at a time.</p>
            <div
              className="preview-letters"
              aria-label="Example spelling: C A T"
            >
              <span>C</span>
              <span>A</span>
              <span className="preview-current">
                T<span className="letter-cursor" />
              </span>
            </div>
            <div className="preview-feedback">
              <Icon name="check" width={17} />
              Small steps are still steps.
            </div>
            <div className="preview-bottom">
              <span>One word at a time</span>
              <span className="preview-mini-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
          <div className="floating-note">
            <span className="note-icon">
              <Icon name="spark" width={18} />
            </span>
            <div>
              <strong>No rush. No competition.</strong>
              <span>Just you, finding your rhythm.</span>
            </div>
          </div>
          <div className="visual-caption">A quieter way to learn English.</div>
        </div>
      </section>
      <div className="principles-strip">
        <div>
          <span>
            <Icon name="headphones" />
            Listen before you spell
          </span>
          <span>
            <Icon name="spark" />
            Gentle help, not harsh grades
          </span>
          <span>
            <Icon name="repeat" />A little repetition goes a long way
          </span>
        </div>
      </div>
      <section className="page-container home-section">
        <div className="section-heading section-heading-large">
          <div>
            <p className="eyebrow">Simple by design</p>
            <h2>Make English feel a little more familiar.</h2>
          </div>
          <p>
            You don’t have to know it all.
            <br />
            You just need a place to begin.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((f) => (
            <article key={f.title} className="panel feature-card">
              <span className="icon-tile">
                <Icon name={f.icon} width={25} height={25} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.copy}</p>
              <Link href={f.href} className="text-button">
                {f.link}
                <Icon name="arrow" width={17} />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="page-container learning-path">
        <div className="section-heading section-heading-large">
          <div>
            <p className="eyebrow">Your learning path</p>
            <h2>From small words to everyday conversations.</h2>
          </div>
          <span className="outlined-badge">{levels.length} gentle levels</span>
        </div>
        <div className="path-grid">
          {levels.map((level) => (
            <div className="path-card" key={level.id}>
              <span className="path-number">
                {String(level.id).padStart(2, "0")}
              </span>
              <h3>{shortLevelName(level.id)}</h3>
              <p>
                {words
                  .filter((word) => word.level === level.id)
                  .slice(0, 3)
                  .map((word) => word.text)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <p className="path-note">
          <Icon name="book" width={16} />
          Start where you are. New levels open as your spelling becomes more
          confident.
        </p>
      </section>
      <section className="page-container">
        <div className="other-practice">
          <div>
            <p className="eyebrow">A little variety</p>
            <h2>English is more than spelling.</h2>
            <p>
              Use your voice, read a short passage, or listen to a useful
              phrase.
            </p>
          </div>
          <div className="other-links">
            <Link href="/pronunciation">
              <Icon name="mic" />
              Listen & repeat <Icon name="arrow" />
            </Link>
            <Link href="/reading">
              <Icon name="book" />
              Read aloud <Icon name="arrow" />
            </Link>
            <Link href="/dictation">
              <Icon name="headphones" />
              Try dictation <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
      <section className="page-container home-bottom">
        <span className="icon-tile">
          <Icon name="sun" width={25} />
        </span>
        <h2>You can start with just one word.</h2>
        <p>Take a breath. Press play. Let’s begin.</p>
        <Link href="/session" className="button button-primary">
          Find my practice space
          <Icon name="arrow" />
        </Link>
      </section>
    </>
  );
}
