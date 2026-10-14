"use client";
import { useEffect, useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import { Icon } from "@/components/ui/Icon";
import { passages } from "@/content/reading";
export default function ReadingPage() {
  const [passage, setPassage] = useState(0);
  const [sentence, setSentence] = useState(0);
  const [timing, setTiming] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const speech = useSpeech();
  const current = passages[passage];
  useEffect(() => {
    if (!timing) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timing]);
  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">One sentence at a time</p>
        <h1>Let the words feel a little easier.</h1>
        <p className="lead">
          Listen to a short passage. Read it aloud. Repeat as often as you like.
        </p>
      </div>
      <div
        className="reading-tabs"
        role="group"
        aria-label="Choose a reading passage"
      >
        {passages.map((p, i) => (
          <button
            key={p.title}
            className={passage === i ? "tab active" : "tab"}
            onClick={() => {
              speech.stop();
              setPassage(i);
              setSentence(0);
              setTiming(false);
              setSeconds(0);
            }}
          >
            {p.title}
          </button>
        ))}
      </div>
      <div className="practice-grid">
        <section className="panel reading-panel">
          <span className="small-badge">{current.topic}</span>
          <h2>{current.title}</h2>
          <div className="passage">
            {current.sentences.map((s, i) => (
              <button
                key={s}
                className={sentence === i ? "sentence selected" : "sentence"}
                onClick={() => {
                  setSentence(i);
                  speech.speak(s);
                }}
                aria-label={`Listen to sentence ${i + 1}: ${s}`}
              >
                {s}
                <Icon name="volume" />
              </button>
            ))}
          </div>
          <div className="audio-buttons">
            <button
              className="button button-primary"
              onClick={() => speech.speak(current.sentences.join(" "))}
            >
              <Icon name="volume" />
              Listen to the passage
            </button>
            <button
              className="button button-outline"
              onClick={() => speech.speak(current.sentences[sentence], true)}
            >
              Slow sentence
            </button>
          </div>
          {speech.message && <p className="notice">{speech.message}</p>}
          <p className="small muted">
            Select any sentence to hear it. Read that sentence aloud, then move
            to the next.
          </p>
        </section>
        <aside className="practice-aside">
          <div className="panel">
            <Icon name="clock" />
            <h3>A timer, only if it helps</h3>
            <p className="muted small">
              For your own comparison, not a test. Smooth reading matters more
              than speed.
            </p>
            <strong className="reading-time">
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </strong>
            <div className="button-row">
              <button
                className="button button-outline compact"
                onClick={() => setTiming((t) => !t)}
              >
                {timing ? "Pause timer" : "Start timer"}
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setTiming(false);
                  setSeconds(0);
                }}
              >
                Reset
              </button>
            </div>
          </div>
          <div className="soft-note">
            <Icon name="repeat" />
            <p>
              Read the same passage again tomorrow. Familiar sentences help you
              find a comfortable rhythm.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
