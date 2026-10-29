"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { addWorkers, broadcast, useDb } from "@/lib/store";
import type { Message } from "@/lib/types";

export function AddWorkerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const db = useDb();
  const [f, setF] = useState({ name: "", email: "", phone: "", categoryId: db.categories[0]?.id ?? "", rating: "4", years: "1" });
  const [csv, setCsv] = useState("");

  function importCsv() {
    const rows = csv.split("\n").map((l) => l.split(",").map((x) => x.trim())).filter((r) => r.length >= 2 && r[0]);
    const parsed = rows.map(([name, email, phone = "", category = "", rating = "4", years = "1"]) => ({
      name, email, phone,
      categoryId: db.categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.id ?? db.categories[0]?.id ?? "",
      rating: Math.min(5, Math.max(1, +rating || 4)), yearsAtMelia: +years || 1,
    }));
    if (!parsed.length) return toast.error("No valid rows found");
    addWorkers(parsed);
    toast.success(`${parsed.length} workers imported`);
    setCsv("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add workers</DialogTitle><DialogDescription>Add one person or paste a list.</DialogDescription></DialogHeader>
        <Tabs defaultValue="one">
          <TabsList className="w-full"><TabsTrigger value="one">One worker</TabsTrigger><TabsTrigger value="csv">Paste CSV</TabsTrigger></TabsList>
          <TabsContent value="one" className="mt-4">
            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault();
              addWorkers([{ name: f.name, email: f.email, phone: f.phone, categoryId: f.categoryId, rating: +f.rating, yearsAtMelia: +f.years }]);
              toast.success("Worker added");
              onOpenChange(false);
            }}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="wn">Name</Label><Input id="wn" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="we">Email</Label><Input id="we" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="wp">Phone</Label><Input id="wp" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Category</Label><SelectField value={f.categoryId} onChange={(v) => setF({ ...f, categoryId: v })} options={db.categories.map((c) => ({ value: c.id, label: c.name }))} /></div>
                <div className="space-y-2"><Label>Rating</Label><SelectField value={f.rating} onChange={(v) => setF({ ...f, rating: v })} options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `★ ${n}` }))} /></div>
                <div className="space-y-2"><Label htmlFor="wy">Years at Meliá</Label><Input id="wy" type="number" min={0} value={f.years} onChange={(e) => setF({ ...f, years: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full">Add worker</Button>
            </form>
          </TabsContent>
          <TabsContent value="csv" className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">One per line: <code>name, email, phone, category, rating, years</code></p>
            <Textarea rows={7} placeholder="Ana Koci, ana@mail.al, +355691234567, Housekeeping, 4, 2" value={csv} onChange={(e) => setCsv(e.target.value)} />
            <Button className="w-full" disabled={!csv.trim()} onClick={importCsv}>Import</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function BroadcastDialog({
  open, onOpenChange, workerIds, onDone,
}: { open: boolean; onOpenChange: (o: boolean) => void; workerIds: string[]; onDone?: () => void }) {
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<Message["channel"]>("WhatsApp");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Message {workerIds.length} worker{workerIds.length === 1 ? "" : "s"}</DialogTitle><DialogDescription>Use {"{name}"} to personalise.</DialogDescription></DialogHeader>
        <SelectField value={channel} onChange={(v) => setChannel(v as Message["channel"])} options={[{ value: "WhatsApp", label: "WhatsApp" }, { value: "App", label: "In-app only" }]} />
        <Textarea rows={5} placeholder="Hi {name}, …" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button disabled={!body.trim() || !workerIds.length} onClick={() => { broadcast(workerIds, body.trim(), channel); toast.success(`Sent to ${workerIds.length}`); setBody(""); onOpenChange(false); onDone?.(); }}>Send</Button>
      </DialogContent>
    </Dialog>
  );
}

export function TagDialog({
  open, onOpenChange, onSave, existing,
}: { open: boolean; onOpenChange: (o: boolean) => void; onSave: (tag: string) => void; existing: string[] }) {
  const [tag, setTag] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Add a tag</DialogTitle></DialogHeader>
        <Input autoFocus placeholder="e.g. night shift" value={tag} onChange={(e) => setTag(e.target.value)} />
        {existing.length > 0 && <div className="flex flex-wrap gap-1.5">{existing.map((t) => <Button key={t} size="xs" variant="outline" onClick={() => setTag(t)}>{t}</Button>)}</div>}
        <Button disabled={!tag.trim()} onClick={() => { onSave(tag.trim()); setTag(""); onOpenChange(false); }}>Apply tag</Button>
      </DialogContent>
    </Dialog>
  );
}
