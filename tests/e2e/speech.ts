import type { Page } from "@playwright/test";
export async function fakeSpeech(page: Page) {
  await page.addInitScript(() => {
    const records: {
      text: string;
      voice: string;
      rate: number;
      lang: string;
    }[] = [];
    const names = ["Google UK English Female", "Google UK English Male"];
    let voices = names.map((name) => ({
      name,
      voiceURI: name,
      lang: "en-GB",
      default: name.endsWith("Female"),
      localService: true,
    }));
    class Utterance {
      constructor(public text: string) {}
      voice: { name: string } | null = null;
      lang = "";
      rate = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: null = null;
    }
    class Synth extends EventTarget {
      getVoices() {
        return voices;
      }
      cancel() {}
      speak(utterance: Utterance) {
        records.push({
          text: utterance.text,
          voice: utterance.voice?.name ?? "",
          rate: utterance.rate,
          lang: utterance.lang,
        });
        queueMicrotask(() => {
          utterance.onstart?.();
          utterance.onend?.();
        });
      }
    }
    const synth = new Synth();
    Object.defineProperty(window, "speechSynthesis", {
      value: synth,
      configurable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: Utterance,
      configurable: true,
    });
    Object.assign(window, {
      __spoken: records,
      __setVoices: (next: string[]) => {
        voices = next.map((name) => ({
          name,
          voiceURI: name,
          lang: "en-GB",
          default: true,
          localService: true,
        }));
        synth.dispatchEvent(new Event("voiceschanged"));
      },
    });
  });
}
export const spoken = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as Window & {
          __spoken: {
            text: string;
            voice: string;
            rate: number;
            lang: string;
          }[];
        }
      ).__spoken,
  );
