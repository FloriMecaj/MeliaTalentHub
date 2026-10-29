"use client";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

/** Thin wrapper over the shadcn Select taking a flat options array. */
export function SelectField({
  id, value, onChange, options, placeholder = "Select…", className, ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Select
      value={value || null}
      onValueChange={(v) => onChange(v ?? "")}
      items={options}
    >
      <SelectTrigger id={id} aria-label={ariaLabel} className={`w-full ${className ?? ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
