"use client";
import { usePractice } from "@/components/PracticeProvider";
import { Icon } from "./Icon";
import type { ThemeChoice } from "@/lib/theme";
const choices: ThemeChoice[] = ["system", "light", "dark"];
const labels = { system: "System", light: "Light", dark: "Dark" };
export function ThemeToggle() {
  const { data, ready, update } = usePractice();
  const theme = data.settings.theme ?? "system";
  const next = choices[(choices.indexOf(theme) + 1) % choices.length];
  return (
    <button
      type="button"
      className="theme-toggle"
      disabled={!ready}
      aria-label={`Theme: ${labels[theme]}. Switch to ${labels[next]}.`}
      title={`Theme: ${labels[theme]}. Switch to ${labels[next]}.`}
      onClick={() =>
        update((d) => ({ ...d, settings: { ...d.settings, theme: next } }))
      }
    >
      <Icon
        name={theme === "dark" ? "moon" : theme === "light" ? "sun" : "monitor"}
      />
      <span>{labels[theme]}</span>
    </button>
  );
}
