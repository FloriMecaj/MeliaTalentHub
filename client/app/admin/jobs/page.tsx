"use client";

import { BriefcaseBusinessIcon, CalendarIcon, CopyIcon, MapPinIcon, PencilIcon, PlusIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChipPicker } from "@/components/chip-picker";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { ConfirmDialog } from "@/components/dashboard/overlays";
import { Empty, KpiStrip, PageHeader, Pill, StatCard } from "@/components/dashboard/parts";
import { FilterBar } from "@/components/dashboard/toolbar";
import { DatePicker } from "@/components/date-picker";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate } from "@/lib/format";
import { LANGUAGES, SKILLS } from "@/lib/options";
import { buildRows } from "@/lib/stages";
import { addJob, deleteJob, duplicateJob, setJobStatus, updateJob, useDb } from "@/lib/store";
import type { Job, Season } from "@/lib/types";

type Draft = Omit<Job, "id" | "createdAt" | "status"> & { id?: string };
const blank = (categoryId: string): Draft => ({
  title: "", categoryId, description: "", requiredSkills: [], languages: [],
  minExperience: 0, positions: 1, season: "summer", location: "Meliá Durrës", deadline: "",
});
const ALL = "all";

export default function AdminJobs() {
  const db = useDb();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [cat, setCat] = useState(ALL);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const patch = (x: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...x } : d));

  const apps = useMemo(() => buildRows(db), [db]);
  const rows = db.jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(q.toLowerCase()) &&
      (status === ALL || j.status === status) &&
      (cat === ALL || j.categoryId === cat),
  );
  const stats = (j: Job) => {
    const a = apps.filter((r) => r.app.jobId === j.id);
    return { total: a.length, hired: a.filter((r) => r.app.stage === "hired").length, top: [...a].sort((x, y) => y.match.score - x.match.score).slice(0, 3) };
  };
  const open = db.jobs.filter((j) => j.status === "open");

  const columns: Column<Job>[] = [
    { key: "t", header: "Job", sort: (j) => j.title, cell: (j) => <><p className="font-medium">{j.title}</p><p className="text-xs text-muted-foreground">{j.location}</p></> },
    { key: "c", header: "Category", cell: (j) => db.categories.find((c) => c.id === j.categoryId)?.name },
    { key: "s", header: "Season", cell: (j) => <span className="capitalize">{j.season}</span> },
    { key: "p", header: "Fill", sort: (j) => stats(j).hired / j.positions, cell: (j) => `${stats(j).hired}/${j.positions}` },
    { key: "a", header: "Applicants", sort: (j) => stats(j).total, cell: (j) => stats(j).total },
    { key: "d", header: "Deadline", cell: (j) => (j.deadline ? fmtDate(j.deadline) : "-") },
    { key: "st", header: "Status", cell: (j) => <Pill tone={j.status === "open" ? "green" : "gray"}>{j.status}</Pill> },
    {
      key: "act", header: "", className: "text-right",
      cell: (j) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon-sm" variant="ghost" aria-label="Edit" onClick={() => setDraft({ ...j })}><PencilIcon /></Button>
          <Button size="icon-sm" variant="ghost" aria-label="Duplicate" onClick={() => { duplicateJob(j.id); toast.success("Job duplicated"); }}><CopyIcon /></Button>
          <Button size="icon-sm" variant="ghost" aria-label="Delete" onClick={() => setDel(j.id)}><Trash2Icon /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Announce work. Students instantly see their compatibility."
        actions={<Button onClick={() => (db.categories.length ? setDraft(blank(db.categories[0].id)) : toast.error("Create a category first"))}><PlusIcon /> Post a job</Button>}
      />
      <KpiStrip>
        <StatCard label="Open jobs" value={open.length} icon={BriefcaseBusinessIcon} hint={`${db.jobs.length - open.length} closed`} />
        <StatCard label="Positions" value={open.reduce((s, j) => s + j.positions, 0)} icon={UsersIcon} hint="across open jobs" />
        <StatCard label="Applications" value={db.applications.length} icon={UsersIcon} />
        <StatCard label="Hired" value={apps.filter((r) => r.app.stage === "hired").length} icon={CalendarIcon} />
      </KpiStrip>

      <FilterBar
        search={q} onSearch={setQ} placeholder="Search jobs…" count={rows.length} total={db.jobs.length}
        active={!!q || status !== ALL || cat !== ALL} onClear={() => { setQ(""); setStatus(ALL); setCat(ALL); }}
        actions={<Tabs value={view} onValueChange={(v) => setView(v as "cards" | "table")}><TabsList><TabsTrigger value="cards">Cards</TabsTrigger><TabsTrigger value="table">Table</TabsTrigger></TabsList></Tabs>}
      >
        <div className="w-36"><SelectField ariaLabel="Status" value={status} onChange={setStatus} options={[{ value: ALL, label: "Any status" }, { value: "open", label: "Open" }, { value: "closed", label: "Closed" }]} /></div>
        <div className="w-44"><SelectField ariaLabel="Category" value={cat} onChange={setCat} options={[{ value: ALL, label: "All categories" }, ...db.categories.map((c) => ({ value: c.id, label: c.name }))]} /></div>
      </FilterBar>

      {db.jobs.length === 0 ? <Empty>No jobs yet. Post your first job.</Empty> : view === "table" ? (
        <DataTable rows={rows} columns={columns} rowId={(j) => j.id} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {rows.map((j) => {
            const s = stats(j);
            return (
              <Card key={j.id} className={j.status === "closed" ? "opacity-70" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>{j.title}</CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3">
                        <span>{db.categories.find((c) => c.id === j.categoryId)?.name}</span>
                        <span className="inline-flex items-center gap-1"><MapPinIcon className="size-3" />{j.location}</span>
                        <span className="capitalize">{j.season}</span>
                      </CardDescription>
                    </div>
                    <Pill tone={j.status === "open" ? "green" : "gray"}>{j.status}</Pill>
                  </div>
                </CardHeader>
                <div className="space-y-4 px-6 pb-6">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm"><span>Positions filled</span><span className="font-semibold">{s.hired}/{j.positions}</span></div>
                    <Progress value={(s.hired / j.positions) * 100} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">{j.requiredSkills.map((k) => <Pill key={k} tone="sky">{k}</Pill>)}{j.languages.map((k) => <Pill key={k} tone="violet">{k}</Pill>)}</div>
                  <div className="rounded-lg bg-muted/60 p-3 text-sm">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">{s.total} applicants · best candidates</p>
                    {s.top.length === 0 ? <p className="text-muted-foreground">No applicants yet.</p> : s.top.map((r) => <p key={r.app.id} className="flex justify-between"><span>{r.user?.name}</span><b>{r.match.score}%</b></p>)}
                  </div>
                  {j.deadline && <p className="text-xs text-muted-foreground">Apply by {fmtDate(j.deadline)}</p>}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDraft({ ...j })}><PencilIcon /> Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => { duplicateJob(j.id); toast.success("Job duplicated"); }}><CopyIcon /> Duplicate</Button>
                    <Button size="sm" variant="outline" onClick={() => setJobStatus(j.id, j.status === "open" ? "closed" : "open")}>{j.status === "open" ? "Close" : "Reopen"}</Button>
                    <Button size="icon-sm" variant="ghost" aria-label="Delete job" onClick={() => setDel(j.id)}><Trash2Icon /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} destructive confirmLabel="Delete job" title="Delete this job?" description="Its applications are removed too. This can't be undone." onConfirm={() => { if (del) deleteJob(del); toast.success("Job deleted"); }} />

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{draft?.id ? "Edit job" : "Post a job"}</DialogTitle></DialogHeader>
          {draft && (
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const { id, ...rest } = draft;
              if (id) updateJob(id, rest);
              else addJob(rest);
              toast.success(id ? "Job updated" : "Job posted");
              setDraft(null);
            }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="t">Title</Label><Input id="t" required value={draft.title} onChange={(e) => patch({ title: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="c">Category</Label><SelectField id="c" value={draft.categoryId} onChange={(v) => patch({ categoryId: v })} options={db.categories.map((c) => ({ value: c.id, label: c.name }))} /></div>
                <div className="space-y-2"><Label htmlFor="s">Season</Label><SelectField id="s" value={draft.season} onChange={(v) => patch({ season: v as Season })} options={[{ value: "summer", label: "Summer" }, { value: "winter", label: "Winter" }, { value: "year", label: "All year" }]} /></div>
                <div className="space-y-2"><Label htmlFor="l">Location</Label><Input id="l" value={draft.location} onChange={(e) => patch({ location: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="p">Positions</Label><Input id="p" type="number" min={1} value={draft.positions} onChange={(e) => patch({ positions: +e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="e">Min. experience (years)</Label><Input id="e" type="number" min={0} value={draft.minExperience} onChange={(e) => patch({ minExperience: +e.target.value })} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Application deadline</Label><DatePicker value={draft.deadline ?? ""} onChange={(v) => patch({ deadline: v })} placeholder="No deadline" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="d">Description</Label><Textarea id="d" rows={3} value={draft.description} onChange={(e) => patch({ description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Required skills</Label><ChipPicker allowCustom options={SKILLS.map((s) => ({ value: s, label: s }))} value={draft.requiredSkills} onChange={(requiredSkills) => patch({ requiredSkills })} /></div>
              <div className="space-y-2"><Label>Required languages</Label><ChipPicker options={LANGUAGES.map((s) => ({ value: s, label: s }))} value={draft.languages} onChange={(languages) => patch({ languages })} /></div>
              <Button type="submit" className="w-full">{draft.id ? "Save changes" : "Publish job"}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
