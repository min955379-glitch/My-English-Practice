import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type SharedProps = {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

type NativeButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkButtonProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

const variants = {
  primary:
    "border-transparent bg-calm-teal-dark text-white hover:bg-calm-text-primary",
  secondary:
    "border-calm-stone-border bg-calm-surface text-calm-text-primary hover:bg-calm-stone-light",
  ghost:
    "border-transparent bg-transparent text-calm-teal-dark hover:bg-calm-teal-light",
} as const;

export function Button(props: ButtonProps) {
  const { variant = "primary", className = "" } = props;
  const classes = [
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-base font-semibold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calm-teal-dark",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className,
  ].join(" ");

  if (typeof props.href === "string") {
    const {
      href,
      children,
      variant: _variant,
      className: _className,
      ...rest
    } = props;
    void _variant;
    void _className;

    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    children,
    type = "button",
    href: _href,
    variant: _variant,
    className: _className,
    ...rest
  } = props as NativeButtonProps;
  void _href;
  void _variant;
  void _className;

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
