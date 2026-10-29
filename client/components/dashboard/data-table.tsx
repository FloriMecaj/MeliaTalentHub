"use client";

import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sort?: (row: T) => string | number;
  className?: string;
};

export function DataTable<T>({
  rows, columns, rowId, selectable = false, selected, onSelectedChange, onRowClick,
  pageSize = 10, empty, initialSort,
}: {
  rows: T[];
  columns: Column<T>[];
  rowId: (row: T) => string;
  selectable?: boolean;
  selected?: Set<string>;
  onSelectedChange?: (s: Set<string>) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  empty?: ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
}) {
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key);
    if (!col?.sort || !sort) return rows;
    const f = col.sort;
    return [...rows].sort((a, b) => {
      const x = f(a), y = f(b);
      const r = x < y ? -1 : x > y ? 1 : 0;
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, columns, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);
  const sel = selected ?? new Set<string>();
  const allOnPage = visible.length > 0 && visible.every((r) => sel.has(rowId(r)));
  const someOnPage = visible.some((r) => sel.has(rowId(r)));

  function toggleAll(on: boolean) {
    const next = new Set(sel);
    visible.forEach((r) => (on ? next.add(rowId(r)) : next.delete(rowId(r))));
    onSelectedChange?.(next);
  }
  function toggleOne(id: string, on: boolean) {
    const next = new Set(sel);
    if (on) next.add(id);
    else next.delete(id);
    onSelectedChange?.(next);
  }

  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select page"
                  checked={allOnPage}
                  indeterminate={!allOnPage && someOnPage}
                  onCheckedChange={(c) => toggleAll(!!c)}
                />
              </TableHead>
            )}
            {columns.map((c) => (
              <TableHead key={c.key} className={c.className}>
                {c.sort ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                    onClick={() =>
                      setSort(sort?.key === c.key ? { key: c.key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" })
                    }
                  >
                    {c.header}
                    {sort?.key === c.key && (sort.dir === "asc" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />)}
                  </button>
                ) : (
                  c.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((r) => {
            const id = rowId(r);
            return (
              <TableRow
                key={id}
                data-state={sel.has(id) ? "selected" : undefined}
                className={onRowClick ? "cursor-pointer" : ""}
                onClick={() => onRowClick?.(r)}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox aria-label="Select row" checked={sel.has(id)} onCheckedChange={(c) => toggleOne(id, !!c)} />
                  </TableCell>
                )}
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.cell(r)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                Nothing matches your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-2 text-sm text-muted-foreground">
          <span>Page {current + 1} of {pages}</span>
          <div className="flex gap-1">
            <Button size="icon-sm" variant="outline" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)}><ChevronLeftIcon /></Button>
            <Button size="icon-sm" variant="outline" aria-label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}><ChevronRightIcon /></Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/** Floating bar shown while rows are selected. */
export function BulkBar({
  count, onClear, children,
}: { count: number; onClear: () => void; children: ReactNode }) {
  if (count === 0) return null;
  return (
    <div className="sticky bottom-4 z-20 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border bg-popover px-4 py-2 shadow-lg">
      <span className="text-sm font-semibold">{count} selected</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <Button size="sm" variant="ghost" onClick={onClear}>Clear</Button>
    </div>
  );
}
