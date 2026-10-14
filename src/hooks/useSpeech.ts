"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePractice } from "@/components/PracticeProvider";
export function useSpeech() {
  const { data } = usePractice();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [message, setMessage] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refresh);
      window.speechSynthesis.cancel();
    };
  }, []);
  const speak = useCallback(
    (text: string, slow = false, onEnd?: () => void) => {
      if (!("speechSynthesis" in window)) {
        setMessage(
          "Audio is unavailable in this browser. Use the written hints to practise spelling.",
        );
        onEnd?.();
        return;
      }
      const available = window.speechSynthesis.getVoices();
      const preferred = available.find(
        (v) =>
          v.voiceURI === data.settings.preferredVoice &&
          v.lang.toLowerCase().replace("_", "-") === "en-gb",
      );
      const voice =
        preferred ??
        available.find(
          (v) => v.lang.toLowerCase().replace("_", "-") === "en-gb",
        ) ??
        available.find((v) => v.lang.startsWith("en"));
      if (!voice) {
        setMessage(
          "No English voice is installed. You can use the written hints, or install an English voice in your device settings.",
        );
        onEnd?.();
        return;
      }
      setMessage(
        voice.lang.toLowerCase().replace("_", "-") === "en-gb"
          ? ""
          : "Using a standard English voice. Install a British English voice for en-GB pronunciation.",
      );
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      active.current = utterance;
      utterance.lang = "en-GB";
      utterance.voice = voice;
      utterance.rate = slow ? data.settings.slowRate : 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = (event) => {
        setSpeaking(false);
        if (event.error !== "interrupted" && event.error !== "canceled")
          setMessage(
            "Audio could not play. Try listening again, or use a written hint.",
          );
      };
      window.speechSynthesis.speak(utterance);
    },
    [data.settings.preferredVoice, data.settings.slowRate],
  );
  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };
  return { speak, stop, voices, speaking, message };
}
