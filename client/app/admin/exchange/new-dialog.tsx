"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { SearchBox } from "@/components/dashboard/toolbar";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usedSlots } from "@/lib/exchange";
import { createExchanges, useDb } from "@/lib/store";
import type { Exchange } from "@/lib/types";

export function NewExchangeDialog({
  open, onOpenChange, presetWorkers = [], presetPartner = "",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  presetWorkers?: string[];
  presetPartner?: string;
}) {
  const db = useDb();
  const [picked, setPicked] = useState<Set<string>>(new Set(presetWorkers));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [partnerId, setPartnerId] = useState(presetPartner);
  const [from, setFrom] = useState("2026-11-15");
  const [to, setTo] = useState("2027-03-31");
  const [salary, setSalary] = useState(1400);
  const [housing, setHousing] = useState(true);
  const [transport, setTransport] = useState(false);
  const [status, setStatus] = useState<Exchange["status"]>("active");
  const [notes, setNotes] = useState("");

  const eligible = db.workers.filter(
    (w) =>
      w.status !== "exchange" && w.status !== "declined" &&
      (cat === "all" || w.categoryId === cat) &&
      w.name.toLowerCase().includes(q.toLowerCase()),
  );
  const partner = db.partners.find((p) => p.id === partnerId);
  const free = partner ? partner.capacity - usedSlots(db, partner.id) : 0;
  const over = partner && picked.size > free;

  function submit() {
    if (!partner || picked.size === 0) return toast.error("Choose at least one worker and a partner");
    createExchanges([...picked], { partnerId, from, to, salary, housing, transport, notes, status });
    toast.success(`${picked.size} placement${picked.size > 1 ? "s" : ""} created`);
    setPicked(new Set());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New exchange</DialogTitle>
          <DialogDescription>Send one or several workers to a partner company for the off-season.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Workers ({picked.size} selected)</Label>
            <div className="flex gap-2">
              <SearchBox value={q} onChange={setQ} placeholder="Search workers…" className="sm:w-full" />
            </div>
            <SelectField ariaLabel="Category" value={cat} onChange={setCat} options={[{ value: "all", label: "All categories" }, ...db.categories.map((c) => ({ value: c.id, label: c.name }))]} />
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
              {eligible.map((w) => (
                <label key={w.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                  <Checkbox
                    checked={picked.has(w.id)}
                    onCheckedChange={(c) => setPicked((s) => { const n = new Set(s); if (c) n.add(w.id); else n.delete(w.id); return n; })}
                  />
                  <span className="flex-1">{w.name}</span>
                  <span className="text-xs text-muted-foreground">{db.categories.find((c) => c.id === w.categoryId)?.name} · ★{w.rating}</span>
                </label>
              ))}
              {eligible.length === 0 && <p className="p-3 text-sm text-muted-foreground">No eligible workers.</p>}
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Partner company</Label>
              <SelectField value={partnerId} onChange={setPartnerId} placeholder="Select a partner…" options={db.partners.map((p) => ({ value: p.id, label: `${p.name} · ${p.capacity - usedSlots(db, p.id)} free` }))} />
              {over && <p className="text-xs text-red-600 dark:text-red-400">Only {free} free slot{free === 1 ? "" : "s"} at {partner?.name}.</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>From</Label><DatePicker value={from} onChange={(v) => { setFrom(v); if (to < v) setTo(v); }} /></div>
              <div className="space-y-2"><Label>To</Label><DatePicker value={to} minDate={from} onChange={setTo} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label htmlFor="sal">Monthly salary (€)</Label><Input id="sal" type="number" min={0} value={salary} onChange={(e) => setSalary(+e.target.value)} /></div>
              <div className="space-y-2"><Label>Starting status</Label><SelectField value={status} onChange={(v) => setStatus(v as Exchange["status"])} options={[{ value: "proposed", label: "Proposed" }, { value: "confirmed", label: "Partner confirmed" }, { value: "active", label: "Active" }]} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 text-sm"><Label htmlFor="hs">Housing provided</Label><Switch id="hs" checked={housing} onCheckedChange={setHousing} /></div>
            <div className="flex items-center justify-between rounded-lg border p-3 text-sm"><Label htmlFor="tr">Transport provided</Label><Switch id="tr" checked={transport} onCheckedChange={setTransport} /></div>
            <Textarea rows={2} placeholder="Notes (role, contact person…)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <Button className="h-10" onClick={submit}>Create {picked.size || ""} placement{picked.size === 1 ? "" : "s"}</Button>
      </DialogContent>
    </Dialog>
  );
}
