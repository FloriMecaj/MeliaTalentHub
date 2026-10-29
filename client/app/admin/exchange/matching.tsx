"use client";

import { ArrowRightIcon, Undo2Icon, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { Empty } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { daysUntil, fmtDate } from "@/lib/format";
import { usedSlots, type ExchangeRow } from "@/lib/exchange";
import { createExchanges, setExchangeStatus, useDb } from "@/lib/store";

/** Suggest top-rated available/confirmed workers for partners that still have free slots. */
export function Matching({ rows }: { rows: ExchangeRow[] }) {
  const db = useDb();
  const free = db.partners.map((p) => ({ p, left: p.capacity - usedSlots(db, p.id) })).filter((x) => x.left > 0);
  const candidates = db.workers
    .filter((w) => (w.status === "available" || w.status === "confirmed") && w.rating >= 4)
    .sort((a, b) => b.rating - a.rating || b.yearsAtMelia - a.yearsAtMelia);

  const suggestions: { workerId: string; partnerId: string }[] = [];
  const slots = free.map((f) => ({ ...f }));
  for (const w of candidates) {
    const s = slots.find((x) => x.left > 0);
    if (!s) break;
    suggestions.push({ workerId: w.id, partnerId: s.p.id });
    s.left--;
  }
  const returning = rows
    .filter((r) => r.x.status === "active" && daysUntil(r.x.to) <= 30)
    .sort((a, b) => (a.x.to < b.x.to ? -1 : 1));

  const assign = (workerId: string, partnerId: string) =>
    createExchanges([workerId], { partnerId, from: "2026-11-15", to: "2027-03-31", salary: 1400, housing: true, transport: false, notes: "Suggested by matching", status: "proposed" });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div><CardTitle>Suggested placements</CardTitle><CardDescription>Top-rated workers (★4+) matched to partners with free slots.</CardDescription></div>
            <Button size="sm" disabled={!suggestions.length} onClick={() => { suggestions.forEach((s) => assign(s.workerId, s.partnerId)); toast.success(`${suggestions.length} proposals created`); }}>
              <WandSparklesIcon /> Propose all
            </Button>
          </div>
        </CardHeader>
        <div className="space-y-2 px-6 pb-6">
          {suggestions.length === 0 && <Empty>No free slots or no eligible workers.</Empty>}
          {suggestions.map((s) => {
            const w = db.workers.find((x) => x.id === s.workerId)!;
            const p = db.partners.find((x) => x.id === s.partnerId)!;
            return (
              <div key={s.workerId} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <div className="flex-1"><b>{w.name}</b> <span className="text-xs text-muted-foreground">{db.categories.find((c) => c.id === w.categoryId)?.name} · ★{w.rating}</span></div>
                <ArrowRightIcon className="size-4 text-muted-foreground" />
                <span className="flex-1 text-right">{p.name}</span>
                <Button size="xs" variant="outline" onClick={() => { assign(s.workerId, s.partnerId); toast.success("Proposal created"); }}>Propose</Button>
              </div>
            );
          })}
        </div>
      </Card>
      <Card className="self-start">
        <CardHeader><CardTitle>Bring back soon</CardTitle><CardDescription>Placements ending within 30 days.</CardDescription></CardHeader>
        <div className="space-y-2 px-6 pb-6">
          {returning.length === 0 && <Empty>No one is due back in the next 30 days.</Empty>}
          {returning.map((r) => (
            <div key={r.x.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              <div className="flex-1"><b>{r.worker?.name}</b><span className="block text-xs text-muted-foreground">{r.partner?.name} · ends {fmtDate(r.x.to)} ({daysUntil(r.x.to)}d)</span></div>
              <Button size="xs" variant="outline" onClick={() => { setExchangeStatus(r.x.id, "returned"); toast.success("Marked returned"); }}><Undo2Icon /> Returned</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
