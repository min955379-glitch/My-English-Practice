"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { selectSpeechVoice, voiceFallbackMessage } from "@/lib/voices";
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
      const gender = data.settings.voiceGender ?? "female";
      const selection = selectSpeechVoice(
        available,
        gender,
        data.settings.preferredVoice,
      );
      const voice = selection.voice;
      setMessage(voiceFallbackMessage(gender, selection));
      if (!voice) {
        onEnd?.();
        return;
      }
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
    [
      data.settings.preferredVoice,
      data.settings.voiceGender,
      data.settings.slowRate,
    ],
  );
  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };
  return { speak, stop, voices, speaking, message };
}
