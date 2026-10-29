"use client";

import { CalendarPlusIcon, ChevronRightIcon, HomeIcon, BusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { ConfirmDialog } from "@/components/dashboard/overlays";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { daysUntil, eur, fmtDate } from "@/lib/format";
import { NEXT_STATUS, X_META, X_STATUSES, type ExchangeRow } from "@/lib/exchange";
import { extendExchange, setExchangeStatus } from "@/lib/store";
import type { Exchange } from "@/lib/types";

const dot: Record<string, string> = { gray: "bg-slate-400", sky: "bg-sky-500", green: "bg-emerald-500", violet: "bg-violet-500", red: "bg-red-500" };

export function Pipeline({ rows }: { rows: ExchangeRow[] }) {
  const [over, setOver] = useState<Exchange["status"] | null>(null);
  const [cancel, setCancel] = useState<string | null>(null);
  const [extend, setExtend] = useState<ExchangeRow | null>(null);
  const [date, setDate] = useState("");

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {X_STATUSES.map((st) => {
          const col = rows.filter((r) => r.x.status === st);
          const meta = X_META[st];
          return (
            <div
              key={st}
              onDragOver={(e) => { e.preventDefault(); setOver(st); }}
              onDragLeave={() => setOver((o) => (o === st ? null : o))}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) setExchangeStatus(id, st); }}
              className={`flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 ${over === st ? "border-primary bg-accent/50" : ""}`}
            >
              <div className="flex items-center gap-2 px-4 py-3">
                <span className={`size-2 rounded-full ${dot[meta.tone]}`} />
                <span className="text-sm font-semibold">{meta.label}</span>
                <span className="ml-auto rounded-full bg-background px-2 text-xs text-muted-foreground">{col.length}</span>
              </div>
              <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
                {col.map((r) => {
                  const left = daysUntil(r.x.to);
                  const next = NEXT_STATUS[r.x.status];
                  return (
                    <div key={r.x.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", r.x.id)} className="cursor-grab rounded-lg border bg-card p-3 shadow-xs active:cursor-grabbing">
                      <p className="text-sm font-semibold">{r.worker?.name}</p>
                      <p className="text-xs text-muted-foreground">{r.category?.name} → {r.partner?.name}</p>
                      <p className="mt-1 text-xs">{fmtDate(r.x.from)} – {fmtDate(r.x.to)}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{eur.format(r.x.salary)}/mo</span>
                        {r.x.housing && <span className="inline-flex items-center gap-1"><HomeIcon className="size-3" />housing</span>}
                        {r.x.transport && <span className="inline-flex items-center gap-1"><BusIcon className="size-3" />transport</span>}
                        {r.x.status === "active" && left >= 0 && left <= 14 && <span className="font-semibold text-amber-600 dark:text-amber-400">returns in {left}d</span>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {next && (
                          <Button size="xs" onClick={() => { setExchangeStatus(r.x.id, next); toast.success(`Marked ${X_META[next].label.toLowerCase()}`); }}>
                            {X_META[next].label} <ChevronRightIcon />
                          </Button>
                        )}
                        {(r.x.status === "active" || r.x.status === "confirmed") && (
                          <Button size="xs" variant="outline" onClick={() => { setExtend(r); setDate(r.x.to); }}><CalendarPlusIcon /> Extend</Button>
                        )}
                        {(r.x.status === "proposed" || r.x.status === "confirmed" || r.x.status === "active") && (
                          <Button size="xs" variant="ghost" onClick={() => setCancel(r.x.id)}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {col.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">Drop here</p>}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!cancel} onOpenChange={(o) => !o && setCancel(null)} destructive confirmLabel="Cancel placement"
        title="Cancel this placement?" description="The worker becomes available again and can be re-assigned."
        onConfirm={() => cancel && setExchangeStatus(cancel, "cancelled")}
      />
      <Dialog open={!!extend} onOpenChange={(o) => !o && setExtend(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Extend {extend?.worker?.name}</DialogTitle></DialogHeader>
          {extend && <DatePicker value={date} minDate={extend.x.to} onChange={setDate} />}
          <Button onClick={() => { if (extend) extendExchange(extend.x.id, date); toast.success("Placement extended"); setExtend(null); }}>Save new end date</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
