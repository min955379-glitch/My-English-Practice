"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePractice } from "@/components/PracticeProvider";
import { useSpeech } from "@/hooks/useSpeech";
import {
  dictationLevels,
  levels,
  shortLevelName,
  wordById,
  words,
} from "@/lib/curriculum";
import {
  mistakeCategory,
  scheduleReview,
  selectSessionWords,
} from "@/lib/learning";
import type { Attempt, PracticeSession } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Microphone } from "./Microphone";
import { ListenInstructions } from "./ListenInstructions";

type Mode = "spelling" | "dictation" | "phonics";
export function DrillEngine({
  mode = "spelling",
  pattern,
}: {
  mode?: Mode;
  pattern?: string;
}) {
  const { data, ready, update, online, storageError, sync } = usePractice();
  const speech = useSpeech();
  const [level, setLevel] = useState(
    mode === "dictation" ? dictationLevels[0].id : levels[0].id,
  );
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [index, setIndex] = useState(0);
  const [bad, setBad] = useState("");
  const [errors, setErrors] = useState(0);
  const [hints, setHints] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const startTime = useRef(0);
  const mistakes = useRef<Attempt["mistakes"]>([]);
  const failures = useRef(new Map<string, number>());
  const stored = useRef(false);
  const hintsAtError = useRef(-1);
  const secondsRef = useRef(0);
  const word = session
    ? wordById.get(session.wordIds[session.cursor])
    : undefined;
  const currentSessionId = session?.id;
  const currentCursor = session?.cursor;
  useEffect(() => {
    if (!currentSessionId || finished || done || !word) return;
    const draft = {
      wordId: word.id,
      index,
      bad,
      errors,
      hints,
      mistakes: [...mistakes.current],
      elapsedMs: Math.max(0, Date.now() - startTime.current),
    };
    update((d) => ({
      ...d,
      sessions: d.sessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, draft, durationSeconds: secondsRef.current }
          : s,
      ),
    }));
  }, [
    currentSessionId,
    currentCursor,
    index,
    bad,
    errors,
    hints,
    done,
    finished,
    word,
    update,
  ]);

  useEffect(() => {
    if (!session || finished || paused) return;
    const timer = setInterval(() => {
      setSeconds((s) => {
        secondsRef.current = s + 1;
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, finished, paused]);
  useEffect(() => {
    if (!currentSessionId || finished || paused) return;
    const checkpoint = setInterval(
      () =>
        update((d) => ({
          ...d,
          sessions: d.sessions.map((s) =>
            s.id === currentSessionId
              ? { ...s, durationSeconds: secondsRef.current }
              : s,
          ),
        })),
      10_000,
    );
    return () => clearInterval(checkpoint);
  }, [currentSessionId, finished, paused, update]);
  useEffect(() => {
    const onExit = () => {
      if (session && !finished) {
        update((d) => ({
          ...d,
          sessions: d.sessions.map((s) =>
            s.id === session.id
              ? { ...s, durationSeconds: secondsRef.current }
              : s,
          ),
        }));
      }
    };
    window.addEventListener("pagehide", onExit);
    return () => window.removeEventListener("pagehide", onExit);
    // Session snapshots are persisted after every completed word as well.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, finished]);
  const play = (slow = false) => {
    if (word) speech.speak(word.text, slow);
  };
  const reset = () => {
    setIndex(0);
    setBad("");
    setErrors(0);
    setHints(0);
    setMessage("");
    setDone(false);
    mistakes.current = [];
    stored.current = false;
    hintsAtError.current = -1;
    startTime.current = Date.now();
  };
  const begin = (resume?: PracticeSession) => {
    const ids = pattern
      ? words.filter((w) => w.patternCategory === pattern).map((w) => w.id)
      : mode === "dictation"
        ? words
            .filter((w) => w.level === level && w.kind !== "word")
            .map((w) => w.id)
        : selectSessionWords(data, level);
    if (!ids.length) return;
    const next = resume ?? {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      level,
      wordIds: ids,
      cursor: 0,
      completed: false,
      mode,
      pattern,
    };
    if (!resume) update((d) => ({ ...d, sessions: [...d.sessions, next] }));
    setSession(next);
    setSeconds(next.durationSeconds);
    secondsRef.current = next.durationSeconds;
    reset();
    setFinished(false);
    setPaused(false);
    if (resume?.draft) {
      const draft = resume.draft;
      setIndex(draft.index);
      setBad(draft.bad);
      setErrors(draft.errors);
      setHints(draft.hints);
      mistakes.current = [...draft.mistakes];
      startTime.current = Date.now() - draft.elapsedMs;
    }
    if (resume?.wordCompleted) {
      const previousWord = wordById.get(resume.wordIds[resume.cursor]);
      if (previousWord) {
        setIndex(previousWord.text.length);
        setDone(true);
        stored.current = true;
      }
    }
    const current = wordById.get(next.wordIds[next.cursor]);
    if (current)
      speech.speak(current.text, false, () => speech.speak(current.text, true));
    setTimeout(() => input.current?.focus(), 50);
  };
  const complete = () => {
    if (!word || !session || stored.current) return;
    stored.current = true;
    const firstForWord = !data.attempts.some(
      (a) => a.sessionId === session.id && a.wordId === word.id,
    );
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      wordId: word.id,
      sessionId: session.id,
      typedAnswer: word.text,
      isCorrect: true,
      isFirstTry: errors === 0 && hints === 0 && firstForWord,
      errorsCount: errors,
      hintsUsed: hints,
      timeSpentMs: Date.now() - startTime.current,
      attemptedAt: new Date().toISOString(),
      mistakeTypes: [
        ...new Set(
          mistakes.current.map((m) =>
            mistakeCategory(
              m.expected,
              m.typed,
              word.text[m.position - 1] ?? "",
            ),
          ),
        ),
      ],
      mistakes: [...mistakes.current],
      mode,
    };
    const queue = [...session.wordIds];
    if (errors > 0 || hints > 0) {
      const count = failures.current.get(word.id) ?? 0;
      if (count < 2) {
        queue.splice(Math.min(queue.length, session.cursor + 3), 0, word.id);
        failures.current.set(word.id, count + 1);
      }
    }
    const next = {
      ...session,
      wordIds: queue,
      durationSeconds: secondsRef.current,
      draft: undefined,
      wordCompleted: true,
    };
    setSession(next);
    update((d) => ({
      ...d,
      attempts: [...d.attempts, attempt],
      reviews: {
        ...d.reviews,
        [word.id]: scheduleReview(
          d.reviews[word.id],
          attempt,
          d.settings.timezone,
        ),
      },
      sessions: d.sessions.map((s) => (s.id === session.id ? next : s)),
    }));
    setDone(true);
    setBad("");
    setMessage("That’s the word. Take a moment to listen again.");
    speech.speak(word.text);
  };
  const typeLetter = (typed: string) => {
    if (!word || done || paused) return;
    if (typed.length !== 1) {
      setMessage(
        "Type one letter at a time. Pasting is not used in this exercise.",
      );
      return;
    }
    if (
      typed.toLocaleLowerCase("en-GB") ===
      word.text[index].toLocaleLowerCase("en-GB")
    ) {
      setBad("");
      setMessage("");
      setIndex(index + 1);
      if (index + 1 === word.text.length) complete();
    } else {
      mistakes.current.push({
        expected: word.text[index],
        typed,
        position: index,
      });
      setBad(typed);
      setErrors((e) => e + 1);
      setMessage("Not quite. Try that letter again.");
    }
  };
  const finish = () => {
    if (!session) return;
    if (word && !done && (index > 0 || errors > 0)) {
      const attempt: Attempt = {
        id: crypto.randomUUID(),
        sessionId: session.id,
        wordId: word.id,
        typedAnswer: word.text.slice(0, index),
        isCorrect: false,
        isFirstTry: false,
        errorsCount: errors,
        hintsUsed: hints,
        timeSpentMs: Date.now() - startTime.current,
        attemptedAt: new Date().toISOString(),
        mistakeTypes: [
          ...new Set(
            mistakes.current.map((m) =>
              mistakeCategory(
                m.expected,
                m.typed,
                word.text[m.position - 1] ?? "",
              ),
            ),
          ),
        ],
        mistakes: [...mistakes.current],
        mode,
      };
      update((d) => ({
        ...d,
        attempts: [...d.attempts, attempt],
        reviews: {
          ...d.reviews,
          [word.id]: scheduleReview(
            d.reviews[word.id],
            attempt,
            d.settings.timezone,
          ),
        },
      }));
    }
    const next = {
      ...session,
      draft: undefined,
      endedAt: new Date().toISOString(),
      durationSeconds: secondsRef.current,
      completed: session.cursor >= session.wordIds.length - 1 && done,
    };
    setSession(next);
    update((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === session.id ? next : s)),
    }));
    speech.stop();
    setFinished(true);
    void sync();
  };
  const next = () => {
    if (!session) return;
    if (session.cursor + 1 >= session.wordIds.length) {
      finish();
      return;
    }
    const nextSession = {
      ...session,
      cursor: session.cursor + 1,
      durationSeconds: secondsRef.current,
      draft: undefined,
      wordCompleted: false,
    };
    setSession(nextSession);
    update((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === session.id ? nextSession : s)),
    }));
    reset();
    const nextWord = wordById.get(nextSession.wordIds[nextSession.cursor]);
    if (nextWord)
      speech.speak(nextWord.text, false, () =>
        speech.speak(nextWord.text, true),
      );
    setTimeout(() => input.current?.focus(), 50);
  };
  const hint = () => {
    if (!word || errors < 2 || hints >= 3) return;
    if (hints > 0 && errors <= hintsAtError.current) {
      setMessage(
        "Try the next letter first. You can listen again at any time.",
      );
      return;
    }
    hintsAtError.current = errors;
    setHints((h) => h + 1);
    if (hints === 0) {
      speech.speak(word.text, true);
      setMessage("Listen slowly. Think about the first sound.");
    }
    if (hints === 1) {
      setMessage(`The first letter is ${word.text[0].toUpperCase()}.`);
      speech.speak(`The first letter is ${word.text[0]}`);
    }
    if (hints === 2) {
      setMessage(`Try these parts: ${word.syllableSplit}.`);
      speech.speak(word.text, true);
    }
    input.current?.focus();
  };
  if (!ready)
    return (
      <div className="page-container">
        <div className="loading-card">Preparing your practice space…</div>
      </div>
    );
  if (finished && session) {
    const attempts = data.attempts.filter((a) => a.sessionId === session.id);
    return (
      <div className="page-container narrow">
        <div className="finish-icon">
          <Icon name="check" width={30} height={30} />
        </div>
        <p className="eyebrow">One small step forward</p>
        <h1>You made time to practise.</h1>
        <p className="lead">
          Every word you return to is another chance to remember it.
        </p>
        <div className="panel finish-stats">
          <div>
            <strong>
              {
                new Set(
                  attempts.filter((a) => a.isCorrect).map((a) => a.wordId),
                ).size
              }
            </strong>
            <span>words practised</span>
          </div>
          <div>
            <strong>
              {Math.floor(seconds / 60)}m {seconds % 60}s
            </strong>
            <span>time spent</span>
          </div>
          <div>
            <strong>
              {
                attempts.filter(
                  (a) => a.errorsCount > 0 || a.hintsUsed > 0 || !a.isCorrect,
                ).length
              }
            </strong>
            <span>items to revisit</span>
          </div>
        </div>
        <p className="muted">
          Tricky words are saved for tomorrow. Same-session reviews don’t count
          as mastery.
        </p>
        <div className="button-row">
          <Link href="/dashboard" className="button button-primary">
            See my progress <Icon name="arrow" />
          </Link>
          <button
            className="button button-outline"
            onClick={() => {
              setSession(null);
              setFinished(false);
            }}
          >
            Practise again
          </button>
        </div>
      </div>
    );
  }
  if (!session) {
    const resumable = data.sessions.findLast(
      (s) =>
        !s.endedAt &&
        !s.completed &&
        s.cursor < s.wordIds.length &&
        (s.mode ?? "spelling") === mode &&
        s.pattern === pattern,
    );
    return (
      <div className="page-container">
        <div className="page-heading">
          <p className="eyebrow">
            {mode === "dictation"
              ? "Listen in context"
              : pattern
                ? "One sound pattern at a time"
                : "Your daily moment of calm"}
          </p>
          <h1>
            {mode === "dictation"
              ? "Sentence & phrase dictation"
              : mode === "phonics"
                ? "A little phonics practice"
                : "Let’s practise, one word at a time."}
          </h1>
          <p className="lead">
            Listen. Spell. Take your time. A little help is always nearby.
          </p>
        </div>
        <div className="setup-grid">
          <div className="panel setup-panel">
            <span className="icon-tile">
              <Icon name="headphones" width={27} height={27} />
            </span>
            <h2>Make a little space for English.</h2>
            <p className="muted">
              Find a quiet spot and turn your sound on. We’ll play each word
              normally, then a little more slowly.
            </p>
            {mode === "spelling" && !pattern && (
              <label className="field-label">
                Your practice level
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                >
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      Level {l.id} — {shortLevelName(l.id)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {mode === "dictation" && (
              <label className="field-label">
                Dictation level
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                >
                  {dictationLevels.map((definition) => (
                    <option key={definition.id} value={definition.id}>
                      Level {definition.id} — {shortLevelName(definition.id)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {mode === "dictation" && (
              <p className="notice">
                Choose any phrase or sentence level. All levels are open from
                your first visit.
              </p>
            )}
            <button
              className="button button-primary wide"
              onClick={() => begin()}
            >
              <Icon name="play" />
              Start my practice
            </button>
            {resumable && mode === "spelling" && !pattern && (
              <button
                className="button button-outline wide"
                onClick={() => begin(resumable)}
              >
                Resume unfinished session
              </button>
            )}
            <p className="small muted">
              <Icon name="clock" /> Your daily aim:{" "}
              {data.settings.dailyTargetMinutes} minutes. You can stop earlier.
            </p>
          </div>
          <div className="setup-notes">
            <ListenInstructions />
            <h3>A simple rhythm</h3>
            {[
              "Listen to the word",
              "Spell one letter at a time",
              "Use a hint if you need it",
              "Return to tricky words",
            ].map((text, i) => (
              <div className="step" key={text}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{text}</strong>
                  <p>
                    {
                      [
                        "Normal speed first. Slow speed next.",
                        "A wrong letter stays put until corrected.",
                        "After two wrong letters, choose gentle help.",
                        "They will come back later and tomorrow.",
                      ][i]
                    }
                  </p>
                </div>
              </div>
            ))}
            <div className="soft-note">
              <Icon name="lock" />{" "}
              {online
                ? "Progress is saved on this device."
                : "You’re offline. Your practice still works."}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!word)
    return (
      <div className="page-container">
        <p>The practice item could not be loaded.</p>
        <button className="button button-outline" onClick={finish}>
          Finish session
        </button>
      </div>
    );
  return (
    <div className="page-container practice-page">
      <div className="session-top">
        <div>
          <p className="eyebrow">
            Level {word.level} · {shortLevelName(word.level)}
          </p>
          <h1>{mode === "dictation" ? "Listen & write" : "Listen & spell"}</h1>
        </div>
        <div className="session-tools">
          <span className="time-chip">
            <Icon name="clock" />
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
          <button
            className="text-button"
            onClick={() => {
              setPaused((p) => !p);
              speech.stop();
            }}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button className="text-button" onClick={finish}>
            Finish for now
          </button>
        </div>
      </div>
      {storageError && <p className="notice">{storageError}</p>}
      <div className="practice-grid">
        <section
          className="panel drill-panel"
          aria-label="Listen and spell exercise"
        >
          <div className="drill-meta">
            <span className="small-badge">
              {session.cursor + 1} of {session.wordIds.length} practice items
            </span>
            <span className="muted small">
              {storageError
                ? "In this tab only"
                : online
                  ? "Saved on this device"
                  : "Offline practice"}
            </span>
          </div>
          <div className="audio-orb">
            <Icon name="headphones" width={34} height={34} />
          </div>
          <h2>
            {paused ? "Take a breath." : "Listen closely. Then give it a try."}
          </h2>
          <p className="muted">
            {paused
              ? "Your timer is paused. Your place is safe."
              : "You can listen as many times as you like."}
          </p>
          <div className="audio-buttons">
            <button
              className="button button-primary"
              onClick={() => play()}
              disabled={paused}
            >
              <Icon name="volume" />
              Listen
            </button>
            <button
              className="button button-outline"
              onClick={() => play(true)}
              disabled={paused}
            >
              <Icon name="play" />
              Listen slowly
            </button>
          </div>
          {speech.message && (
            <p className="notice small" role="status">
              {speech.message}
            </p>
          )}
          {!done &&
            /unavailable|No English|could not play/.test(speech.message) && (
              <button
                className="text-button"
                onClick={() => {
                  setHints(3);
                  setMessage(
                    `Written practice: ${word.text}. This is recorded as assisted practice.`,
                  );
                  input.current?.focus();
                }}
              >
                Use written practice instead
              </button>
            )}
          {!paused && (
            <>
              <p className="input-caption">
                {done ? "The complete word" : "Type one letter at a time"}
              </p>
              <div
                className={`letter-stage ${done ? "complete" : ""}`}
                onClick={() => input.current?.focus()}
              >
                <div className="letter-slots" aria-hidden="true">
                  {Array.from(word.text).map((letter, i) => (
                    <span
                      key={i}
                      className={`letter-slot ${letter === " " ? "space-slot" : ""} ${i === index && !done ? "current" : ""} ${i === index && bad ? "wrong-letter" : ""}`}
                    >
                      {i < index
                        ? letter.toUpperCase()
                        : i === index && bad
                          ? bad === " "
                            ? "␣"
                            : bad.toUpperCase()
                          : letter === " "
                            ? "·"
                            : ""}
                    </span>
                  ))}
                </div>
                <input
                  ref={input}
                  className="letter-capture"
                  aria-label="Type the spelling one letter at a time"
                  value=""
                  onChange={(e) => typeLetter(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    setMessage("Please type one letter at a time.");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !done) {
                      e.preventDefault();
                      if (bad) {
                        setBad("");
                      } else setIndex((i) => Math.max(0, i - 1));
                    }
                  }}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={done}
                  inputMode="text"
                />
              </div>
              <p className="feedback" aria-live="polite" aria-atomic="true">
                {message || "Your keyboard is ready. You’ve got time."}
              </p>
              {hints >= 3 && (
                <div className="syllable-chips">
                  {word.syllables.map((part, i) => (
                    <span
                      key={i}
                      className={
                        word.stressPattern.split("-")[i] === "1"
                          ? "stressed"
                          : ""
                      }
                    >
                      {part}
                    </span>
                  ))}
                </div>
              )}
              {!done && (
                <div className="hint-row">
                  <Icon name="spark" />
                  <span className="small muted">
                    {errors < 2
                      ? "Gentle hints appear after two wrong letters."
                      : "A little help, one step at a time."}
                  </span>
                  <button
                    className="text-button"
                    onClick={hint}
                    disabled={errors < 2 || hints >= 3}
                  >
                    {hints >= 3 ? "All hints shown" : "I need a hint"}
                  </button>
                </div>
              )}
              {done && (
                <div className="word-result">
                  <strong>{word.meaning}</strong>
                  <p>{word.example}</p>
                  <p className="family-note">
                    Spelling family: {word.wordFamily}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => speech.speak(word.example)}
                  >
                    <Icon name="volume" width={16} />
                    Listen to this sentence
                  </button>
                  <button className="button button-primary" onClick={next}>
                    {session.cursor + 1 >= session.wordIds.length
                      ? "Finish practice"
                      : "Next word"}
                    <Icon name="arrow" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        <aside className="practice-aside">
          <div className="panel">
            <p className="eyebrow">Small steps count</p>
            <h3>Your session</h3>
            <ProgressBar
              value={session.cursor + (done ? 1 : 0)}
              max={session.wordIds.length}
              label="Practice progress"
            />
            <p className="small muted">
              No rush. No points. Just a little more familiarity with each word.
            </p>
            {seconds >= data.settings.dailyTargetMinutes * 60 && (
              <p className="notice">
                You’ve reached your daily aim. Finish whenever you feel ready.
              </p>
            )}
          </div>
          <Microphone />
          <div className="soft-note">
            <Icon name="repeat" />
            <p>
              Mistakes are part of learning. Tricky words will return after a
              few other items.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
