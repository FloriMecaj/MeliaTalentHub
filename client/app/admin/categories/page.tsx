"use client";

import { ArrowLeftIcon, ArrowRightIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/overlays";
import { KpiStrip, PageHeader, ScoreRing, StatCard } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteCategory, moveCategory, saveCategory, useDb } from "@/lib/store";
import type { Category } from "@/lib/types";

const COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#64748b"];

export default function CategoriesPage() {
  const db = useDb();
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [del, setDel] = useState<Category | null>(null);

  const totals = db.categories.reduce(
    (a, c) => ({
      target: a.target + (c.target ?? 0),
      secured: a.secured + db.workers.filter((w) => w.categoryId === c.id && (w.status === "confirmed" || w.status === "exchange")).length,
    }),
    { target: 0, secured: 0 },
  );

  return (
    <>
      <PageHeader
        title="Work categories"
        description="Categories drive job announcements, student matching, invitation counts and headcount targets."
        actions={<Button onClick={() => setEditing({ name: "", description: "", target: 5, color: COLORS[0] })}><PlusIcon /> New category</Button>}
      />
      <KpiStrip>
        <StatCard label="Categories" value={db.categories.length} />
        <StatCard label="Headcount target" value={totals.target} hint="for the coming season" />
        <StatCard label="Secured so far" value={totals.secured} hint="confirmed or on exchange" />
        <StatCard label="Gap to fill" value={Math.max(totals.target - totals.secured, 0)} />
      </KpiStrip>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {db.categories.map((c, i) => {
          const team = db.workers.filter((w) => w.categoryId === c.id);
          const secured = team.filter((w) => w.status === "confirmed" || w.status === "exchange").length;
          const invited = team.filter((w) => w.status === "invited").length;
          const jobs = db.jobs.filter((j) => j.categoryId === c.id);
          const jobIds = jobs.map((j) => j.id);
          const applicants = db.applications.filter((a) => jobIds.includes(a.jobId)).length;
          const target = c.target ?? 0;
          const pct = target ? Math.min(100, Math.round((secured / target) * 100)) : 0;
          return (
            <Card key={c.id} style={{ borderTop: `3px solid ${c.color ?? COLORS[0]}` }}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div><CardTitle>{c.name}</CardTitle><CardDescription className="mt-1">{c.description}</CardDescription></div>
                  <ScoreRing score={pct} size={60} color={c.color ?? COLORS[0]} />
                </div>
              </CardHeader>
              <div className="space-y-4 px-6 pb-6">
                <dl className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div><dd className="text-lg font-bold">{team.length}</dd><dt className="text-xs text-muted-foreground">workers</dt></div>
                  <div><dd className="text-lg font-bold">{jobs.length}</dd><dt className="text-xs text-muted-foreground">jobs</dt></div>
                  <div><dd className="text-lg font-bold">{applicants}</dd><dt className="text-xs text-muted-foreground">applicants</dt></div>
                  <div><dd className="text-lg font-bold">{invited}</dd><dt className="text-xs text-muted-foreground">invited</dt></div>
                </dl>
                <p className="text-sm text-muted-foreground">{secured} of {target || "no"} target secured</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(c)}><PencilIcon /> Edit</Button>
                  <Button size="icon-sm" variant="ghost" aria-label="Move earlier" disabled={i === 0} onClick={() => moveCategory(c.id, -1)}><ArrowLeftIcon /></Button>
                  <Button size="icon-sm" variant="ghost" aria-label="Move later" disabled={i === db.categories.length - 1} onClick={() => moveCategory(c.id, 1)}><ArrowRightIcon /></Button>
                  <Button size="icon-sm" variant="ghost" className="ml-auto" aria-label="Delete" onClick={() => (team.length || jobs.length ? toast.error("Category is in use by workers or jobs") : setDel(c))}><Trash2Icon /></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} destructive confirmLabel="Delete" title={`Delete ${del?.name}?`} description="This category has no workers or jobs." onConfirm={() => { if (del) deleteCategory(del.id); toast.success("Category deleted"); }} />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              saveCategory({ id: editing.id, name: editing.name ?? "", description: editing.description ?? "", target: editing.target, color: editing.color });
              toast.success("Category saved");
              setEditing(null);
            }}>
              <div className="space-y-2"><Label htmlFor="n">Name</Label><Input id="n" required value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="d">Description</Label><Textarea id="d" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="t">Headcount target</Label><Input id="t" type="number" min={0} value={editing.target ?? 0} onChange={(e) => setEditing({ ...editing, target: +e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Colour</Label>
                <div className="flex gap-2">
                  {COLORS.map((col) => (
                    <button key={col} type="button" aria-label={col} onClick={() => setEditing({ ...editing, color: col })} className={`size-7 rounded-full ${editing.color === col ? "ring-2 ring-offset-2 ring-offset-background" : ""}`} style={{ background: col, ["--tw-ring-color" as string]: col }} />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
