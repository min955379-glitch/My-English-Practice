"use client";
import { useState } from "react";
import { patterns, words } from "@/lib/curriculum";
import { useSpeech } from "@/hooks/useSpeech";
import { DrillEngine } from "@/components/practice/DrillEngine";
import { Icon } from "@/components/ui/Icon";
const groups = [
  {
    title: "Start with the sounds",
    categories: ["short_cvc", "silent_e", "double_consonant"],
  },
  {
    title: "Two letters, one sound",
    categories: [
      "digraph_sh",
      "digraph_ch",
      "digraph_th",
      "digraph_wh",
      "digraph_ph",
    ],
  },
  {
    title: "Sounds that blend",
    categories: [
      "blend_bl",
      "blend_br",
      "blend_cl",
      "blend_tr",
      "blend_fl",
      "blend_fr",
    ],
  },
  {
    title: "Build the bigger picture",
    categories: ["two_syllables", "silent_letter", "irregular"],
  },
];
const titles: Record<string, string> = {
  short_cvc: "Short vowels",
  silent_e: "The quiet final e",
  double_consonant: "Double consonants",
  digraph_sh: "The sh sound",
  digraph_ch: "The ch sound",
  digraph_th: "The th sounds",
  digraph_wh: "The wh pattern",
  digraph_ph: "The ph sound",
  blend_bl: "Blend: bl",
  blend_br: "Blend: br",
  blend_cl: "Blend: cl",
  blend_tr: "Blend: tr",
  blend_fl: "Blend: fl",
  blend_fr: "Blend: fr",
  two_syllables: "Syllables & stress",
  silent_letter: "Silent letters",
  irregular: "Useful exceptions",
};
export default function PhonicsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const speech = useSpeech();
  if (selected)
    return (
      <>
        <div className="page-container phonics-back">
          <button className="text-button" onClick={() => setSelected(null)}>
            Back to all sound patterns
          </button>
        </div>
        <DrillEngine mode="phonics" pattern={selected} />
      </>
    );
  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">Make sense of the sounds</p>
        <h1>Small patterns. Bigger confidence.</h1>
        <p className="lead">
          English spelling feels less mysterious when you notice how letters
          work together.
        </p>
      </div>
      <div className="phonics-banner">
        <span className="icon-tile">
          <Icon name="volume" width={26} height={26} />
        </span>
        <div>
          <h3>Listen to sounds, not just letter names.</h3>
          <p>
            A letter’s name and its sound are different. Listen to an example
            word, notice the pattern, then try spelling it.
          </p>
        </div>
      </div>
      {speech.message && (
        <p className="notice" role="status">
          {speech.message}
        </p>
      )}
      {groups.map((group) => (
        <section key={group.title} className="topic-section">
          <div className="section-heading">
            <h2>{group.title}</h2>
            <span>{group.categories.length} patterns</span>
          </div>
          <div className="topic-grid">
            {group.categories.map((category) => {
              const pattern = patterns.find((p) => p.category === category);
              if (!pattern) return null;
              const examples = pattern.exampleWords;
              const hasDrill = words.some(
                (w) => w.patternCategory === category,
              );
              return (
                <article className="panel topic-card" key={category}>
                  <span className="pattern-tag">
                    {category === "short_cvc"
                      ? "a · e · i · o · u"
                      : category
                          .replace("digraph_", "")
                          .replace("blend_", "")
                          .replaceAll("_", " ")}
                  </span>
                  <h3>{titles[category]}</h3>
                  <p>{pattern.description}</p>
                  <div className="example-words">
                    {examples.map((example) => (
                      <button
                        key={example}
                        onClick={() => speech.speak(example)}
                        aria-label={`Listen to ${example}`}
                      >
                        {example}
                        <Icon name="volume" width={14} height={14} />
                      </button>
                    ))}
                  </div>
                  {hasDrill ? (
                    <button
                      className="text-button"
                      onClick={() => setSelected(category)}
                    >
                      Practise this pattern <Icon name="arrow" width={17} />
                    </button>
                  ) : (
                    <span className="small muted">
                      Listen and repeat these examples.
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
      <section className="topic-section">
        <div className="section-heading">
          <h2>Words that belong together</h2>
          <span>Spelling families</span>
        </div>
        <p className="muted small" style={{ marginBottom: 20 }}>
          Notice the shared ending. The first sound changes, but a familiar
          spelling pattern stays.
        </p>
        <div className="topic-grid">
          {[
            { ending: "-at", examples: ["cat", "hat", "mat"] },
            { ending: "-ame", examples: ["name", "same", "game"] },
            { ending: "-ight", examples: ["night", "light", "right"] },
            { ending: "-ain", examples: ["train", "rain", "pain"] },
            { ending: "-ook", examples: ["book", "look", "cook"] },
          ].map((family) => (
            <article className="panel topic-card" key={family.ending}>
              <span className="pattern-tag">{family.ending}</span>
              <h3>The {family.ending} family</h3>
              <div className="example-words">
                {family.examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => speech.speak(example)}
                    aria-label={`Listen to ${example}`}
                  >
                    {example}
                    <Icon name="volume" width={14} />
                  </button>
                ))}
              </div>
              <p>
                Listen to each word. Say the shared ending, then the whole word.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
