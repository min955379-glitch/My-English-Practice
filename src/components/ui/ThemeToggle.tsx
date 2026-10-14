"use client";
import { useSyncExternalStore } from "react";
import { usePractice } from "@/components/PracticeProvider";
import { Icon } from "./Icon";
function subscribe(change: () => void) {
  const observer = new MutationObserver(change);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}
export function ThemeToggle() {
  const { data, ready, update } = usePractice();
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
  const labels = { system: "System", light: "Light", dark: "Dark" };
  const theme = data.settings.theme ?? "system";
  const next = dark ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle icon-only"
      disabled={!ready}
      aria-label={`Theme: ${labels[theme]}. Switch to ${labels[next]}.`}
      title={`Switch to ${labels[next]} theme`}
      onClick={() =>
        update((d) => ({ ...d, settings: { ...d.settings, theme: next } }))
      }
    >
      <Icon name={dark ? "moon" : "sun"} width={22} height={22} />
    </button>
  );
}
