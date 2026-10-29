"use client";

import { DownloadIcon, PencilIcon, PlusIcon, RotateCcwIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/overlays";
import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteTemplate, exportDb, importDb, resetDemo, saveTemplate, setSeason, useDb } from "@/lib/store";
import type { MessageTemplate } from "@/lib/types";

export default function SettingsPage() {
  const db = useDb();
  const [season, setSeasonDraft] = useState(db.settings.season);
  const [tpl, setTpl] = useState<Partial<MessageTemplate> | null>(null);
  const [reset, setReset] = useState(false);

  function backup() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([exportDb()], { type: "application/json" }));
    a.download = `melia-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function restore(file: File | undefined) {
    if (!file) return;
    try {
      importDb(await file.text());
      toast.success("Backup restored");
    } catch {
      toast.error("That file isn't a valid backup");
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Season, message templates and your data." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Season</CardTitle><CardDescription>Used as the default in invitation campaigns.</CardDescription></CardHeader>
          <div className="flex gap-2 px-6 pb-6">
            <Input aria-label="Season" value={season} onChange={(e) => setSeasonDraft(e.target.value)} />
            <Button disabled={season === db.settings.season} onClick={() => { setSeason(season); toast.success("Season updated"); }}>Save</Button>
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Data</CardTitle><CardDescription>Everything is stored in this browser. Back it up or reset to the demo data.</CardDescription></CardHeader>
          <div className="flex flex-wrap gap-2 px-6 pb-6">
            <Button variant="outline" onClick={backup}><DownloadIcon /> Download backup</Button>
            <Button variant="outline" nativeButton={false} render={<label />}><UploadIcon /> Restore backup<input type="file" accept="application/json" className="sr-only" onChange={(e) => restore(e.target.files?.[0])} /></Button>
            <Button variant="destructive" onClick={() => setReset(true)}><RotateCcwIcon /> Reset demo data</Button>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle>Message templates</CardTitle><CardDescription>Variables: {"{name} {category} {season} {deadline}"}</CardDescription></div>
              <Button size="sm" onClick={() => setTpl({ name: "", body: "" })}><PlusIcon /> New template</Button>
            </div>
          </CardHeader>
          <div className="grid gap-3 px-6 pb-6 md:grid-cols-2">
            {db.templates.map((t) => (
              <div key={t.id} className="space-y-2 rounded-xl border p-4">
                <div className="flex items-center justify-between"><p className="font-semibold">{t.name}</p>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" aria-label="Edit template" onClick={() => setTpl(t)}><PencilIcon /></Button>
                    <Button size="icon-sm" variant="ghost" aria-label="Delete template" onClick={() => { deleteTemplate(t.id); toast.success("Template deleted"); }}><Trash2Icon /></Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ConfirmDialog open={reset} onOpenChange={setReset} destructive confirmLabel="Reset everything" title="Reset to demo data?" description="All jobs, applicants, workers, campaigns and exchanges you created are replaced with the original demo data." onConfirm={() => { resetDemo(); toast.success("Demo data restored"); }} />
      <Dialog open={!!tpl} onOpenChange={(o) => !o && setTpl(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{tpl?.id ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          {tpl && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); saveTemplate({ id: tpl.id, name: tpl.name ?? "", body: tpl.body ?? "" }); toast.success("Template saved"); setTpl(null); }}>
              <div className="space-y-2"><Label htmlFor="tn">Name</Label><Input id="tn" required value={tpl.name ?? ""} onChange={(e) => setTpl({ ...tpl, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="tb">Message</Label><Textarea id="tb" rows={5} required value={tpl.body ?? ""} onChange={(e) => setTpl({ ...tpl, body: e.target.value })} /></div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
