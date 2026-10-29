"use client";

import { SearchIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBox({
  value, onChange, placeholder = "Search…", className = "",
}: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative w-full sm:w-72 ${className}`}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8"
      />
    </div>
  );
}

/** Search + filters row with a result counter and a clear button. */
export function FilterBar({
  search, onSearch, placeholder, children, count, total, active, onClear, actions,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
  count: number;
  total: number;
  active: boolean;
  onClear: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchBox value={search} onChange={onSearch} placeholder={placeholder} />
      {children}
      {active && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <XIcon /> Clear
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        {count === total ? `${total} total` : `${count} of ${total}`}
      </span>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
