export type ThemeChoice = "system" | "light" | "dark";
export const THEME_KEY = "english-practice-theme";
export const isThemeChoice = (value: unknown): value is ThemeChoice =>
  value === "system" || value === "light" || value === "dark";

export function applyTheme(choice: ThemeChoice) {
  const dark =
    choice === "dark" ||
    (choice === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  document.documentElement.dataset.theme = choice;
}

// A synchronous mirror is necessary: IndexedDB cannot be read before first paint.
// All progress exports and cloud settings still use the canonical Settings value.
export const THEME_BOOTSTRAP = `(()=>{let t="system";try{const s=localStorage.getItem("${THEME_KEY}");if(s==="system"||s==="light"||s==="dark")t=s;}catch{}const d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";document.documentElement.dataset.theme=t;})();`;
