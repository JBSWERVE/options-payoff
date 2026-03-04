"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Dropdown({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select...",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Scroll focused item into view
  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
          setFocusedIndex(options.findIndex((o) => o.value === value));
        }
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0) {
            onChange(options[focusedIndex].value);
            setOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [open, focusedIndex, options, value, onChange, disabled],
  );

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setOpen((v) => !v);
              setFocusedIndex(options.findIndex((o) => o.value === value));
            }
          }}
          onKeyDown={handleKeyDown}
          className="w-full h-10 px-3 pr-8 bg-surface border border-border-custom rounded-md text-sm text-left text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-border-focus transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={value ? "" : "text-text-muted"}>{selectedLabel}</span>
          <svg
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && options.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-surface-elevated border border-border-custom rounded-md py-1 shadow-lg"
          >
            {options.map((opt, i) => (
              <li
                key={opt.value}
                onMouseEnter={() => setFocusedIndex(i)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  i === focusedIndex
                    ? "bg-accent/15 text-accent"
                    : opt.value === value
                      ? "text-accent"
                      : "text-text-primary hover:bg-surface"
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
