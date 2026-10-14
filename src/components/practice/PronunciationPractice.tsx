"use client";
import { useState } from "react";
import { words, shortLevelName, levels } from "@/lib/curriculum";
import { useSpeech } from "@/hooks/useSpeech";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Microphone } from "@/components/practice/Microphone";
export function PronunciationPractice({
  initialLevel = 1,
}: {
  initialLevel?: number;
}) {
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState(initialLevel);
  const speech = useSpeech();
  const collection = words.filter((w) => w.level === level);
  const word = collection[index % collection.length];
  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">Find your own voice</p>
        <h1>Listen. Repeat. Feel more familiar.</h1>
        <p className="lead">
          A little spoken practice, without grades or pressure.
        </p>
      </div>
      <div className="practice-grid">
        <section className="panel pronunciation-panel">
          <Select
            label="Choose words"
            value={String(level)}
            options={levels.map((l) => ({
              value: String(l.id),
              label: `Level ${l.id} — ${shortLevelName(l.id)}`,
            }))}
            onChange={(value) => {
              setLevel(Number(value));
              setIndex(0);
            }}
          />
          <div className="audio-orb">
            <Icon name="volume" width={32} height={32} />
          </div>
          <h2 className="spoken-word">{word.text}</h2>
          <p className="ipa">{word.phonetic}</p>
          <div className="syllable-chips">
            {word.syllables.map((part, i) => (
              <span
                key={i}
                className={
                  word.stressPattern.split("-")[i] === "1" ? "stressed" : ""
                }
              >
                {part}
              </span>
            ))}
          </div>
          <p className="muted">
            Listen once. Listen slowly. Then say it in your own voice.
          </p>
          <div className="audio-buttons">
            <button
              className="button button-primary"
              onClick={() => speech.speak(word.text)}
            >
              <Icon name="volume" />
              Listen
            </button>
            <button
              className="button button-outline"
              onClick={() => speech.speak(word.text, true)}
            >
              <Icon name="play" />
              Listen slowly
            </button>
          </div>
          {speech.message && (
            <p className="notice" role="status">
              {speech.message}
            </p>
          )}
          <p className="example-sentence">{word.example}</p>
          <button
            className="text-button"
            onClick={() => {
              speech.stop();
              setIndex((i) => i + 1);
            }}
          >
            Try another word <Icon name="arrow" />
          </button>
        </section>
        <aside className="practice-aside">
          <Microphone key={`${level}:${index}`} />
          <div className="soft-note">
            <Icon name="book" />
            <p>
              The darker syllable is stressed. IPA is here if it helps — you do
              not need to learn the symbols to practise.
            </p>
          </div>
          <div className="soft-note">
            <Icon name="lock" />
            <p>
              Microphone transcripts are hints, not pronunciation grades. They
              do not affect your spelling progress.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
