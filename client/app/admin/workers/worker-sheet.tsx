"use client";

import { MailIcon, PhoneIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ChipPicker } from "@/components/chip-picker";
import { DetailSheet } from "@/components/dashboard/overlays";
import { Pill, ScoreRing } from "@/components/dashboard/parts";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { eur, fmtDate, timeAgo } from "@/lib/format";
import { updateWorker, useDb } from "@/lib/store";
import type { WorkerStatus } from "@/lib/types";

const STATUSES: WorkerStatus[] = ["available", "invited", "confirmed", "declined", "exchange"];

export function WorkerSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const db = useDb();
  const w = db.workers.find((x) => x.id === id);
  const [note, setNote] = useState<string | null>(null);
  if (!w) return null;

  const messages = db.messages.filter((m) => m.workerId === w.id).slice(0, 5);
  const exchanges = db.exchanges.filter((x) => x.workerId === w.id);
  const campaigns = db.campaigns.filter((c) => c.workerIds.includes(w.id));
  const reliability = Math.max(0, Math.min(100, w.rating * 14 + w.yearsAtMelia * 6 + (w.status === "declined" ? -20 : 0) + (w.status === "confirmed" ? 6 : 0)));
  const allTags = [...new Set(db.workers.flatMap((x) => x.tags))];

  return (
    <DetailSheet open onOpenChange={(o) => !o && onClose()} title={w.name} description={`${db.categories.find((c) => c.id === w.categoryId)?.name} · ${w.yearsAtMelia} yrs at Meliá`}>
      <div className="flex items-center gap-4 rounded-xl border p-4">
        <ScoreRing score={reliability} size={72} />
        <div className="space-y-1 text-sm">
          <p className="font-semibold">Reliability score</p>
          <p className="flex items-center gap-1 text-muted-foreground"><StarIcon className="size-3.5 fill-amber-400 text-amber-400" />{w.rating} rating · based on rating, tenure and replies</p>
          <div className="flex gap-2 pt-1">
            <Button size="xs" variant="outline" nativeButton={false} render={<a href={`mailto:${w.email}`} />}><MailIcon /> Email</Button>
            <Button size="xs" variant="outline" nativeButton={false} render={<a href={`tel:${w.phone}`} />}><PhoneIcon /> {w.phone}</Button>
          </div>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Status</h3>
        <SelectField value={w.status} onChange={(v) => { updateWorker(w.id, { status: v as WorkerStatus }); toast.success("Status updated"); }} options={STATUSES.map((s) => ({ value: s, label: s }))} />
        {w.declineReason && <p className="text-sm text-muted-foreground">Declined: {w.declineReason}</p>}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Tags</h3>
        <ChipPicker allowCustom options={allTags.map((t) => ({ value: t, label: t }))} value={w.tags} onChange={(tags) => updateWorker(w.id, { tags })} placeholder="Add a tag…" />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Notes</h3>
        <Textarea rows={3} value={note ?? w.notes} onChange={(e) => setNote(e.target.value)} placeholder="Private notes about this worker…" />
        <Button size="sm" disabled={note === null || note === w.notes} onClick={() => { updateWorker(w.id, { notes: note ?? "" }); setNote(null); toast.success("Note saved"); }}>Save note</Button>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">History</h3>
        {campaigns.map((c) => <p key={c.id} className="text-sm">Invited in <b>{c.name}</b> · {fmtDate(c.createdAt)}</p>)}
        {exchanges.map((x) => (
          <p key={x.id} className="flex items-center justify-between text-sm">
            {db.partners.find((p) => p.id === x.partnerId)?.name} · {fmtDate(x.from)} – {fmtDate(x.to)} · {eur.format(x.salary)}
            <Pill tone={x.status === "active" ? "green" : "gray"}>{x.status}</Pill>
          </p>
        ))}
        {campaigns.length + exchanges.length === 0 && <p className="text-sm text-muted-foreground">No campaigns or exchanges yet.</p>}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Recent messages</h3>
        {messages.map((m) => <p key={m.id} className="rounded-lg bg-muted p-3 text-sm">{m.body}<span className="block text-xs text-muted-foreground">{m.channel} · {timeAgo(m.createdAt)}</span></p>)}
        {messages.length === 0 && <p className="text-sm text-muted-foreground">Nothing sent yet.</p>}
      </section>
    </DetailSheet>
  );
}
