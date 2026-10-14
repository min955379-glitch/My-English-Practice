import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-calm-stone-border bg-calm-surface p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
