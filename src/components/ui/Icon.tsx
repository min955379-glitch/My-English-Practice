import type { SVGProps } from "react";
export type IconName =
  | "book"
  | "play"
  | "arrow"
  | "headphones"
  | "spark"
  | "chart"
  | "mic"
  | "check"
  | "clock"
  | "chevron"
  | "volume"
  | "pause"
  | "settings"
  | "download"
  | "repeat"
  | "lock"
  | "sun";
const paths: Record<IconName, string> = {
  book: "M12 6C9 4 5 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-2-1-6-1-9 1Zm0 0v14",
  play: "m9 5 11 7-11 7V5Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  headphones: "M4 13v-1a8 8 0 0 1 16 0v1M4 12H2v8h4v-8H4Zm16 0h2v8h-4v-8h2Z",
  spark: "m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z",
  chart: "M4 20V10m6 10V4m6 16v-8m5 8H2",
  mic: "M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3Zm-7-4v1a7 7 0 0 0 14 0v-1m-7 8v3m-4 0h8",
  check: "m5 12 4 4L19 6",
  clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  chevron: "m9 5 7 7-7 7",
  volume: "M11 5 6 9H3v6h3l5 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  pause: "M8 5v14M16 5v14",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  repeat: "M4 7h13l-3-3m6 13H7l3 3M4 7v6m16 4v-6",
  lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 5v2",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1",
};
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
