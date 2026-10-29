"use client";

import { useState } from "react";
import { Empty, Pill } from "@/components/dashboard/parts";
import { Card } from "@/components/ui/card";
import { X_META, type ExchangeRow } from "@/lib/exchange";

const bar: Record<string, string> = { gray: "bg-slate-400", sky: "bg-sky-500", green: "bg-emerald-500", violet: "bg-violet-500", red: "bg-red-400" };

export function Timeline({ rows }: { rows: ExchangeRow[] }) {
  const [now] = useState(() => Date.now());
  const live = rows.filter((r) => r.x.status !== "cancelled");
  if (live.length === 0) return <Empty>No placements to show yet.</Empty>;

  const t = (s: string) => new Date(s).getTime();
  const min = Math.min(...live.map((r) => t(r.x.from)));
  const max = Math.max(...live.map((r) => t(r.x.to)));
  const start = new Date(min); start.setDate(1);
  const end = new Date(max); end.setMonth(end.getMonth() + 1, 1);
  const span = end.getTime() - start.getTime();
  const pct = (ms: number) => ((ms - start.getTime()) / span) * 100;

  const months: Date[] = [];
  for (const d = new Date(start); d < end; d.setMonth(d.getMonth() + 1)) months.push(new Date(d));
  const today = pct(now);

  return (
    <Card className="gap-0 overflow-x-auto p-0">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[200px_1fr] border-b bg-muted/40 text-xs font-medium text-muted-foreground">
          <div className="px-4 py-2">Worker</div>
          <div className="relative flex">
            {months.map((m) => (
              <div key={m.toISOString()} className="flex-1 border-l px-2 py-2">{m.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}</div>
            ))}
          </div>
        </div>
        {live.map((r) => {
          const meta = X_META[r.x.status];
          return (
            <div key={r.x.id} className="grid grid-cols-[200px_1fr] border-b last:border-0">
              <div className="px-4 py-3 text-sm"><p className="font-medium">{r.worker?.name}</p><p className="text-xs text-muted-foreground">{r.partner?.name}</p></div>
              <div className="relative py-3">
                {months.map((m, i) => <div key={i} className="absolute inset-y-0 border-l" style={{ left: `${(i / months.length) * 100}%` }} />)}
                {today > 0 && today < 100 && <div className="absolute inset-y-0 z-10 w-px bg-amber-500" style={{ left: `${today}%` }} />}
                <div
                  className={`relative flex h-7 items-center rounded-md px-2 text-xs font-medium text-white ${bar[meta.tone]}`}
                  style={{ marginLeft: `${pct(t(r.x.from))}%`, width: `${Math.max(pct(t(r.x.to)) - pct(t(r.x.from)), 3)}%` }}
                  title={`${r.x.from} → ${r.x.to}`}
                >
                  <span className="truncate">{meta.label}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-xs text-muted-foreground">
          <Pill tone="amber">Today line</Pill>
          Bars are coloured by status; drag cards on the Pipeline tab to change it.
        </div>
      </div>
    </Card>
  );
}
