"use client";
import Link from "next/link";
import { useState } from "react";
import { usePractice } from "@/components/PracticeProvider";
import { levels, words, patterns, shortLevelName } from "@/lib/curriculum";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
export default function LearnPage() {
  const { data } = usePractice();
  const [search, setSearch] = useState("");
  const visible = levels.filter((l) =>
    `${l.name} ${l.description} ${words
      .filter((w) => w.level === l.id)
      .map((w) => w.text)
      .join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">Your learning studio</p>
        <h1>Find your next useful word.</h1>
        <p className="lead">
          All thirteen levels are open. Explore a sound, choose an everyday
          phrase or take on a longer word.
        </p>
      </div>
      <div className="studio-strip">
        <div className="studio-stat">
          <Icon name="layers" />
          <div>
            <strong>{levels.length}</strong>
            <span>levels, always open</span>
          </div>
        </div>
        <div className="studio-stat">
          <Icon name="book" />
          <div>
            <strong>{words.length}</strong>
            <span>practice items</span>
          </div>
        </div>
        <div className="studio-stat">
          <Icon name="headphones" />
          <div>
            <strong>{patterns.length}</strong>
            <span>spelling patterns</span>
          </div>
        </div>
      </div>
      <div
        className="resource-banner"
        style={{ marginTop: 0, marginBottom: 30 }}
      >
        <div>
          <h2>A little structure, your own pace.</h2>
          <p>
            Choose a strategy and plan a comfortable week. Nothing here limits
            your access.
          </p>
        </div>
        <div className="button-row">
          <Link href="/guides" className="button button-outline">
            Study guides
            <Icon name="book" />
          </Link>
          <Link href="/planner" className="button button-primary">
            My weekly plan
            <Icon name="calendar" />
          </Link>
        </div>
      </div>
      <label className="field-label" htmlFor="level-search">
        Find a level or word
      </label>
      <input
        id="level-search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Try accommodation, short vowels or dictation"
        style={{ width: "100%", marginBottom: 20 }}
      />
      <p className="small muted" role="status" style={{ marginBottom: 20 }}>
        {visible.length} learning levels shown
      </p>
      <div className="hub-grid">
        {visible.map((l) => {
          const items = words.filter((w) => w.level === l.id),
            completed = items.filter((w) =>
              data.attempts.some((a) => a.wordId === w.id && a.isCorrect),
            ).length;
          return (
            <article className="panel hub-card" key={l.id}>
              <span className="card-kicker">
                Level {String(l.id).padStart(2, "0")} · {items.length} items
              </span>
              <h2>{shortLevelName(l.id)}</h2>
              <p>{l.description}</p>
              <div className="level-examples">
                {items
                  .slice(0, 4)
                  .map((w) => w.text)
                  .join(" · ")}
              </div>
              <ProgressBar
                label={`Level ${l.id} completion`}
                value={completed}
                max={items.length}
              />
              <p className="small muted">
                {completed} of {items.length} items completed
              </p>
              <Link
                className="button button-outline"
                href={`/session?level=${l.id}`}
              >
                Practise this level
                <Icon name="arrow" width={17} />
              </Link>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <p className="notice">
          No level matches that search. Try a shorter word or a spelling
          pattern.
        </p>
      )}
      <div className="resource-banner">
        <div>
          <h2>Make room for a different kind of practice.</h2>
          <p>Listening, phonics and reading work together.</p>
        </div>
        <div className="button-row">
          <Link className="button button-outline" href="/phonics">
            Phonics
          </Link>
          <Link className="button button-outline" href="/reading">
            Read aloud
          </Link>
          <Link className="button button-outline" href="/pronunciation">
            Listen & repeat
          </Link>
        </div>
      </div>
    </div>
  );
}
