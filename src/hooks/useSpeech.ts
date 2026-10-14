"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { selectSpeechVoice, voiceFallbackMessage } from "@/lib/voices";
import { hasAudioConsent } from "@/lib/audio";
import { usePractice } from "@/components/PracticeProvider";
const clipCache = new Map<string, Blob>();
let availability: Promise<boolean> | undefined;
function audioAvailability() {
  return (availability ??= fetch("/api/speech")
    .then((r) => (r.ok ? r.json() : null))
    .then((v) => v?.available === true)
    .catch(() => false));
}
export function useSpeech() {
  const { data } = usePractice();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [message, setMessage] = useState(""),
    [speaking, setSpeaking] = useState(false),
    [enhancedAvailable, setEnhancedAvailable] = useState(false);
  const active = useRef<SpeechSynthesisUtterance | null>(null),
    player = useRef<HTMLAudioElement | null>(null),
    url = useRef<string | null>(null),
    pending = useRef<AbortController | null>(null),
    generation = useRef(0);
  const stop = useCallback(() => {
    generation.current++;
    pending.current?.abort();
    pending.current = null;
    if (player.current) {
      player.current.pause();
      player.current.src = "";
      player.current = null;
    }
    if (url.current) {
      URL.revokeObjectURL(url.current);
      url.current = null;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);
  useEffect(() => {
    let alive = true;
    void audioAvailability().then((value) => {
      if (alive) setEnhancedAvailable(value);
    });
    const refresh = () => {
      if ("speechSynthesis" in window)
        setVoices(window.speechSynthesis.getVoices());
    };
    refresh();
    const reconnect = () => {
      availability = undefined;
      void audioAvailability().then((value) => {
        if (alive) setEnhancedAvailable(value);
      });
    };
    window.addEventListener("online", reconnect);
    window.speechSynthesis?.addEventListener("voiceschanged", refresh);
    window.addEventListener("english-practice-stop-audio", stop);
    return () => {
      alive = false;
      window.removeEventListener("online", reconnect);
      window.speechSynthesis?.removeEventListener("voiceschanged", refresh);
      window.removeEventListener("english-practice-stop-audio", stop);
      stop();
    };
  }, [stop]);
  const speak = useCallback(
    (text: string, slow = false, onEnd?: () => void) => {
      window.dispatchEvent(new Event("english-practice-stop-audio"));
      const token = generation.current;
      const gender = data.settings.voiceGender ?? "female",
        rate = slow ? data.settings.slowRate : 1;
      const device = (prefix = "") => {
        if (token !== generation.current) return;
        if (!("speechSynthesis" in window)) {
          setMessage(
            `${prefix}Audio is unavailable in this browser. Use the written hints to practise spelling.`,
          );
          onEnd?.();
          return;
        }
        const selection = selectSpeechVoice(
          window.speechSynthesis.getVoices(),
          gender,
          data.settings.preferredVoice,
        );
        setMessage(prefix + voiceFallbackMessage(gender, selection));
        if (!selection.voice) {
          onEnd?.();
          return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        active.current = utterance;
        utterance.lang = "en-GB";
        utterance.voice = selection.voice;
        utterance.rate = rate;
        utterance.onstart = () => {
          if (token === generation.current) setSpeaking(true);
        };
        utterance.onend = () => {
          if (token === generation.current) {
            setSpeaking(false);
            onEnd?.();
          }
        };
        utterance.onerror = (event) => {
          if (token === generation.current) {
            setSpeaking(false);
            if (!["interrupted", "canceled"].includes(event.error))
              setMessage(
                "Audio could not play. Try listening again, or use a written hint.",
              );
          }
        };
        window.speechSynthesis.speak(utterance);
      };
      if (data.settings.audioSource !== "enhanced") {
        device();
        return;
      }
      if (!hasAudioConsent()) {
        device(
          "Enhanced audio needs your permission in Settings. Using this device. ",
        );
        return;
      }
      if (!enhancedAvailable || !navigator.onLine) {
        device("Enhanced audio is unavailable right now. Using this device. ");
        return;
      }
      setMessage("Preparing British English audio…");
      setSpeaking(true);
      const controller = new AbortController();
      pending.current = controller;
      const cacheKey = JSON.stringify([text, gender, rate]);
      void (async () => {
        try {
          let clip = clipCache.get(cacheKey);
          if (!clip) {
            const response = await fetch("/api/speech", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, gender, rate, consent: true }),
              signal: controller.signal,
            });
            if (!response.ok) throw Error("audio");
            clip = await response.blob();
            if (!clip.size || !clip.type.startsWith("audio/"))
              throw Error("audio");
            if (clipCache.size >= 32)
              clipCache.delete(clipCache.keys().next().value!);
            clipCache.set(cacheKey, clip);
          }
          if (token !== generation.current) return;
          const source = URL.createObjectURL(clip);
          url.current = source;
          const audio = new Audio(source);
          player.current = audio;
          audio.onended = () => {
            if (token !== generation.current) return;
            setSpeaking(false);
            URL.revokeObjectURL(source);
            url.current = null;
            player.current = null;
            onEnd?.();
          };
          audio.onerror = () => {
            if (token === generation.current) {
              setSpeaking(false);
              URL.revokeObjectURL(source);
              url.current = null;
              player.current = null;
              device("Enhanced audio could not play. Using this device. ");
            }
          };
          await audio.play();
          if (token === generation.current)
            setMessage(
              `Using ${gender === "male" ? "Ryan" : "Sonia"}, a British English ${gender} voice.`,
            );
        } catch {
          if (token === generation.current) {
            if (url.current) {
              URL.revokeObjectURL(url.current);
              url.current = null;
            }
            player.current = null;
            setSpeaking(false);
            device("Enhanced audio could not play. Using this device. ");
          }
        }
      })();
    },
    [
      data.settings.preferredVoice,
      data.settings.voiceGender,
      data.settings.audioSource,
      data.settings.slowRate,
      enhancedAvailable,
    ],
  );
  return { speak, stop, voices, speaking, message, enhancedAvailable };
}
