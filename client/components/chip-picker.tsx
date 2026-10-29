"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

type Option = { value: string; label: string };

export function ChipPicker({
  options, value, onChange, allowCustom = false, placeholder = "Add your own…",
}: {
  options: Option[];
  value: string[];
  onChange: (v: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const known = new Set(options.map((o) => o.value));
  const custom = value.filter((v) => !known.has(v));

  function add() {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  }

  const chip = (selected: boolean) =>
    `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors ${
      selected
        ? "border-primary bg-accent text-accent-foreground"
        : "border-border text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button type="button" key={o.value} onClick={() => toggle(o.value)} className={chip(value.includes(o.value))}>
            {o.label}
          </button>
        ))}
        {custom.map((v) => (
          <button type="button" key={v} onClick={() => toggle(v)} className={chip(true)}>
            {v} <XIcon className="size-3" />
          </button>
        ))}
      </div>
      {allowCustom && (
        <div className="flex max-w-sm gap-2">
          <Input
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" onClick={add} aria-label="Add" className="rounded-lg border px-3 hover:bg-muted">
            <PlusIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
