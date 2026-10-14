import Link from "next/link";
import { guides } from "@/content/guides";
import { Icon } from "@/components/ui/Icon";
export default function GuidesPage() {
  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">A toolkit for real learning</p>
        <h1>Small strategies. Lasting confidence.</h1>
        <p className="lead">
          Practical ways to listen, notice a spelling and return to it. Use one
          idea at a time.
        </p>
      </div>
      <div className="guide-layout">
        <nav className="panel guide-menu" aria-label="Study guide sections">
          {guides.map((g) => (
            <a key={g.id} href={`#${g.id}`}>
              {g.title}
            </a>
          ))}
        </nav>
        <div>
          {guides.map((g) => (
            <section className="panel guide-section" key={g.id} id={g.id}>
              <span className="icon-tile">
                <Icon name={g.icon} />
              </span>
              <h2>{g.title}</h2>
              <p>
                <strong>{g.summary}</strong>
              </p>
              {g.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="guide-example">{g.example}</div>
              <ul>
                {g.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <Link className="text-button" href={g.href}>
                {g.link}
                <Icon name="arrow" width={17} />
              </Link>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
