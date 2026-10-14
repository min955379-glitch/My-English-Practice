"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
type RecognitionEvent = {
  results: { [index: number]: { [index: number]: { transcript: string } } };
};
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export function Microphone() {
  const [supported, setSupported] = useState(false);
  const [consent, setConsent] = useState(false);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const recogniser = useRef<Recognition | null>(null);
  useEffect(() => {
    const w = window as RecognitionWindow;
    queueMicrotask(() =>
      setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition)),
    );
    return () => recogniser.current?.abort();
  }, []);
  const start = () => {
    if (listening) {
      recogniser.current?.stop();
      return;
    }
    const w = window as RecognitionWindow;
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Constructor) return;
    window.speechSynthesis?.cancel();
    const recognition = new Constructor();
    recogniser.current = recognition;
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e) =>
      setMessage(
        `I heard: ${e.results[0][0].transcript}. Listen to the reference and try again whenever you like.`,
      );
    recognition.onerror = (e) => {
      setListening(false);
      setMessage(
        e.error === "not-allowed"
          ? "Microphone permission was not granted. You can continue without it."
          : "I could not hear clearly. Try again in a quieter place, or continue without the microphone.",
      );
    };
    recognition.onend = () => setListening(false);
    try {
      recognition.start();
      setListening(true);
      setMessage("Listening. Say the word or sentence when you are ready.");
    } catch {
      setListening(false);
      setMessage(
        "The microphone could not start. You can keep practising without it.",
      );
    }
  };
  return (
    <div className="mic-panel">
      <div className="section-line">
        <span className="small-icon">
          <Icon name="mic" />
        </span>
        <h3>Try saying it aloud</h3>
        <span className="small-badge">Optional</span>
      </div>
      {!supported ? (
        <p className="muted small">
          Microphone recognition is not available in this browser. Listen and
          repeat instead — your practice still counts.
        </p>
      ) : (
        <>
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (!e.target.checked) {
                  recogniser.current?.abort();
                  setListening(false);
                }
              }}
            />{" "}
            I understand that my browser may send speech to its recognition
            provider. This website does not save microphone audio.
          </label>
          <button
            className="button button-outline compact"
            disabled={!consent}
            onClick={start}
          >
            <Icon name="mic" />
            {listening ? "Stop listening" : "Speak and check"}
          </button>
        </>
      )}
      {message && (
        <p role="status" className="feedback small">
          {message}
        </p>
      )}
    </div>
  );
}
