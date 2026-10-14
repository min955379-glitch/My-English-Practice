"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
};
export function Select({
  label,
  value,
  onChange,
  options,
  id: givenId,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  disabled?: boolean;
}) {
  const generated = useId(),
    id = givenId ?? generated;
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(0),
    [above, setAbove] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const search = useRef({ text: "", time: 0 });
  const selected = options.findIndex((o) => o.value === value);
  const enabled = options
    .map((o, i) => (o.disabled ? -1 : i))
    .filter((i) => i >= 0);
  const show = () => {
    if (disabled || !enabled.length) return;
    setActive(
      selected >= 0 && !options[selected].disabled ? selected : enabled[0],
    );
    setAbove(
      (trigger.current?.getBoundingClientRect().bottom ?? 0) >
        window.innerHeight - 260,
    );
    setOpen(true);
  };
  const choose = (index: number) => {
    if (!options[index] || options[index].disabled) return;
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => {
    if (open)
      root.current
        ?.querySelector("[data-active=true]")
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);
  return (
    <div
      className="select-control"
      ref={root}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={id} className="field-label" id={`${id}-label`}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        className="select-trigger"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-controls={`${id}-list`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        data-value={value}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            return;
          }
          if (e.key === "Tab") {
            setOpen(false);
            return;
          }
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            if (!open) {
              show();
              return;
            }
            const pos = enabled.indexOf(active);
            setActive(
              e.key === "Home"
                ? enabled[0]
                : e.key === "End"
                  ? enabled.at(-1)!
                  : enabled[
                      (pos +
                        (e.key === "ArrowDown" ? 1 : -1) +
                        enabled.length) %
                        enabled.length
                    ],
            );
            return;
          }
          if ((e.key === "Enter" || e.key === " ") && open) {
            e.preventDefault();
            choose(active);
            return;
          }
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.key !== " ") {
            const now = Date.now();
            search.current = {
              text:
                (now - search.current.time > 700 ? "" : search.current.text) +
                e.key.toLowerCase(),
              time: now,
            };
            const found = options.findIndex(
              (o) =>
                !o.disabled &&
                o.label.toLowerCase().startsWith(search.current.text),
            );
            if (found >= 0) {
              e.preventDefault();
              if (!open) show();
              setActive(found);
            }
          }
        }}
      >
        <span>{options[selected]?.label ?? "Choose an option"}</span>
        <Icon name="chevron" width={18} />
      </button>
      {open && (
        <div
          className={`select-menu ${above ? "select-above" : ""}`}
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
        >
          {options.map((option, i) => (
            <button
              type="button"
              role="option"
              id={`${id}-option-${i}`}
              key={option.value}
              tabIndex={-1}
              aria-selected={value === option.value}
              aria-disabled={option.disabled || undefined}
              data-value={option.value}
              data-active={i === active}
              className="select-option"
              onPointerMove={() => {
                if (!option.disabled) setActive(i);
              }}
              onClick={() => choose(i)}
            >
              <span>
                <strong>{option.label}</strong>
                {option.description && <small>{option.description}</small>}
              </span>
              {value === option.value && <Icon name="check" width={18} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
