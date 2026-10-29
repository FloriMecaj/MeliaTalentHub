"use client";

import {
  CalendarClockIcon, ChevronDownIcon, DownloadIcon, FileCheckIcon, GitCompareIcon,
  SparklesIcon, TrophyIcon, UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BulkBar, DataTable, type Column } from "@/components/dashboard/data-table";
import { Empty, KpiStrip, PageHeader, Pill, ScoreRing, StatCard } from "@/components/dashboard/parts";
import { FilterBar } from "@/components/dashboard/toolbar";
import { SelectField } from "@/components/select-field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv, fmtDate, initials } from "@/lib/format";
import { setApplicationStage, useDb } from "@/lib/store";
import { buildRows, STAGE_META, type ApplicantRow } from "@/lib/stages";
import { STAGES, type Stage } from "@/lib/types";
import { ApplicantSheet } from "./applicant-sheet";
import { Board } from "./board";

const ALL = "all";

export default function ApplicantsPage() {
  const db = useDb();
  const [view, setView] = useState<"board" | "table">("board");
  const [q, setQ] = useState("");
  const [job, setJob] = useState(ALL);
  const [cat, setCat] = useState(ALL);
  const [stage, setStage] = useState(ALL);
  const [band, setBand] = useState(ALL);
  const [cv, setCv] = useState(ALL);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);

  const all = useMemo(() => buildRows(db), [db]);
  const rows = all.filter((r) => {
    const text = `${r.user?.name} ${r.user?.email} ${r.job?.title}`.toLowerCase();
    return (
      text.includes(q.toLowerCase()) &&
      (job === ALL || r.app.jobId === job) &&
      (cat === ALL || r.job?.categoryId === cat) &&
      (stage === ALL || r.app.stage === stage) &&
      (band === ALL || r.match.label === band) &&
      (cv === ALL || (cv === "yes") === !!r.profile?.cv)
    );
  });
  const active = [q, job, cat, stage, band, cv].some((v) => v && v !== ALL);
  const clear = () => { setQ(""); setJob(ALL); setCat(ALL); setStage(ALL); setBand(ALL); setCv(ALL); };

  const selectedRows = all.filter((r) => selected.has(r.app.id));
  const hired = all.filter((r) => r.app.stage === "hired").length;
  const interviews = all.filter((r) => r.app.stage === "interview").length;
  const fresh = all.filter((r) => r.app.stage === "new").length;
  const avg = all.length ? Math.round(all.reduce((s, r) => s + r.match.score, 0) / all.length) : 0;
  const upcoming = all
    .filter((r) => r.app.interviewAt)
    .sort((a, b) => (a.app.interviewAt! < b.app.interviewAt! ? -1 : 1))
    .slice(0, 4);

  function topPicks() {
    const ids = new Set<string>();
    db.jobs.filter((j) => j.status === "open").forEach((j) => {
      all
        .filter((r) => r.app.jobId === j.id && r.app.stage !== "hired" && r.app.stage !== "rejected")
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 3)
        .forEach((r) => ids.add(r.app.id));
    });
    setSelected(ids);
    toast.success(`${ids.size} top picks selected (best 3 per job)`);
  }

  function exportCsv(list: ApplicantRow[]) {
    downloadCsv("applicants.csv", [
      ["Name", "Email", "Job", "Stage", "Match %", "Has CV", "Interview", "Applied"],
      ...list.map((r) => [r.user?.name, r.user?.email, r.job?.title, r.app.stage, r.match.score, !!r.profile?.cv, r.app.interviewAt, r.app.createdAt.slice(0, 10)]),
    ]);
  }

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const columns: Column<ApplicantRow>[] = [
    {
      key: "name", header: "Applicant", sort: (r) => r.user?.name ?? "",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8"><AvatarFallback className="text-xs">{initials(r.user?.name ?? "?")}</AvatarFallback></Avatar>
          <div><p className="font-medium">{r.user?.name}</p><p className="text-xs text-muted-foreground">{r.user?.email}</p></div>
        </div>
      ),
    },
    { key: "job", header: "Job", sort: (r) => r.job?.title ?? "", cell: (r) => <><p>{r.job?.title}</p><p className="text-xs text-muted-foreground">{r.category?.name}</p></> },
    { key: "match", header: "Match", sort: (r) => r.match.score, cell: (r) => <div className="flex items-center gap-2"><ScoreRing score={r.match.score} size={40} /><span className="text-xs text-muted-foreground">{r.match.label}</span></div> },
    { key: "stage", header: "Stage", sort: (r) => STAGES.indexOf(r.app.stage), cell: (r) => <Pill tone={STAGE_META[r.app.stage].tone}>{STAGE_META[r.app.stage].label}</Pill> },
    { key: "interview", header: "Interview", sort: (r) => r.app.interviewAt ?? "", cell: (r) => (r.app.interviewAt ? fmtDate(r.app.interviewAt) : <span className="text-muted-foreground">-</span>) },
    { key: "cv", header: "CV", cell: (r) => (r.profile?.cv ? <Pill tone="sky">CV</Pill> : <span className="text-muted-foreground">-</span>) },
    { key: "applied", header: "Applied", sort: (r) => r.app.createdAt, cell: (r) => fmtDate(r.app.createdAt) },
  ];

  return (
    <>
      <PageHeader
        title="Applicants"
        description="Review, rank and move candidates through your hiring pipeline."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={topPicks}><TrophyIcon /> Top picks</Button>
            <Button variant="outline" onClick={() => exportCsv(rows)}><DownloadIcon /> Export CSV</Button>
          </div>
        }
      />

      <KpiStrip>
        <StatCard label="Applicants" value={all.length} icon={UsersIcon} hint={`${fresh} new to review`} />
        <StatCard label="In interview" value={interviews} icon={CalendarClockIcon} hint={`${upcoming.length} scheduled`} />
        <StatCard label="Hired" value={hired} icon={FileCheckIcon} hint={`of ${db.jobs.reduce((s, j) => s + j.positions, 0)} open positions`} />
        <StatCard label="Avg. match" value={`${avg}%`} icon={SparklesIcon} />
      </KpiStrip>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Position fill</CardTitle><CardDescription>Hired vs positions per open job. Click to filter.</CardDescription></CardHeader>
          <div className="grid gap-x-8 gap-y-4 px-6 pb-6 sm:grid-cols-2">
            {db.jobs.filter((j) => j.status === "open").map((j) => {
              const h = all.filter((r) => r.app.jobId === j.id && r.app.stage === "hired").length;
              return (
                <button key={j.id} type="button" onClick={() => setJob(job === j.id ? ALL : j.id)} className={`space-y-1.5 rounded-lg p-2 text-left hover:bg-muted ${job === j.id ? "bg-accent" : ""}`}>
                  <div className="flex justify-between text-sm"><span className="font-medium">{j.title}</span><span className="text-muted-foreground">{h}/{j.positions}</span></div>
                  <Progress value={(h / j.positions) * 100} />
                </button>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming interviews</CardTitle></CardHeader>
          <div className="space-y-3 px-6 pb-6">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">None scheduled. Open an applicant to schedule one.</p>}
            {upcoming.map((r) => (
              <button key={r.app.id} type="button" onClick={() => setOpenId(r.app.id)} className="flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm hover:bg-muted">
                <span><b>{r.user?.name}</b><span className="block text-xs text-muted-foreground">{r.job?.title}</span></span>
                <span className="text-xs">{fmtDate(r.app.interviewAt)}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <FilterBar
        search={q} onSearch={setQ} placeholder="Search name, email or job…"
        count={rows.length} total={all.length} active={active} onClear={clear}
        actions={
          <Tabs value={view} onValueChange={(v) => setView(v as "board" | "table")}>
            <TabsList><TabsTrigger value="board">Board</TabsTrigger><TabsTrigger value="table">Table</TabsTrigger></TabsList>
          </Tabs>
        }
      >
        <div className="w-44"><SelectField ariaLabel="Job" value={job} onChange={setJob} options={[{ value: ALL, label: "All jobs" }, ...db.jobs.map((j) => ({ value: j.id, label: j.title }))]} /></div>
        <div className="w-40"><SelectField ariaLabel="Category" value={cat} onChange={setCat} options={[{ value: ALL, label: "All categories" }, ...db.categories.map((c) => ({ value: c.id, label: c.name }))]} /></div>
        <div className="w-36"><SelectField ariaLabel="Stage" value={stage} onChange={setStage} options={[{ value: ALL, label: "All stages" }, ...STAGES.map((s) => ({ value: s, label: STAGE_META[s].label }))]} /></div>
        <div className="w-40"><SelectField ariaLabel="Match" value={band} onChange={setBand} options={[{ value: ALL, label: "Any match" }, { value: "Compatible", label: "Compatible 70+" }, { value: "Partial", label: "Partial 40-69" }, { value: "Low", label: "Low <40" }]} /></div>
        <div className="w-32"><SelectField ariaLabel="CV" value={cv} onChange={setCv} options={[{ value: ALL, label: "Any CV" }, { value: "yes", label: "Has CV" }, { value: "no", label: "No CV" }]} /></div>
      </FilterBar>

      {all.length === 0 ? (
        <Empty>No applications yet. Students apply from their dashboard.</Empty>
      ) : view === "board" ? (
        <Board rows={rows} selected={selected} onToggle={toggle} onOpen={setOpenId} />
      ) : (
        <DataTable
          rows={rows} columns={columns} rowId={(r) => r.app.id}
          selectable selected={selected} onSelectedChange={setSelected}
          onRowClick={(r) => setOpenId(r.app.id)}
          initialSort={{ key: "match", dir: "desc" }}
        />
      )}

      <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>Move to <ChevronDownIcon /></DropdownMenuTrigger>
          <DropdownMenuContent>
            {STAGES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => { setApplicationStage([...selected], s as Stage); toast.success(`${selected.size} moved to ${STAGE_META[s].label}`); setSelected(new Set()); }}>
                {STAGE_META[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selected.size === 2 && <Button size="sm" variant="outline" onClick={() => setCompare(true)}><GitCompareIcon /> Compare</Button>}
        <Button size="sm" variant="outline" onClick={() => exportCsv(selectedRows)}><DownloadIcon /> Export</Button>
        <Button size="sm" variant="destructive" onClick={() => { setApplicationStage([...selected], "rejected"); toast(`${selected.size} rejected`); setSelected(new Set()); }}>Reject</Button>
      </BulkBar>

      <ApplicantSheet id={openId} onClose={() => setOpenId(null)} />

      <Dialog open={compare} onOpenChange={setCompare}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>Compare candidates</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {selectedRows.slice(0, 2).map((r) => (
              <div key={r.app.id} className="space-y-3 rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <ScoreRing score={r.match.score} size={64} />
                  <div><p className="font-semibold">{r.user?.name}</p><p className="text-sm text-muted-foreground">{r.job?.title}</p></div>
                </div>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Experience</dt><dd>{r.profile?.experienceYears} yrs</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Availability</dt><dd className="capitalize">{r.profile?.availability}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Languages</dt><dd>{r.profile?.languages.join(", ")}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">CV</dt><dd>{r.profile?.cv ? "Yes" : "No"}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Stage</dt><dd>{STAGE_META[r.app.stage].label}</dd></div>
                </dl>
                <div className="flex flex-wrap gap-1.5">{r.profile?.skills.map((s) => <Pill key={s} tone={r.job?.requiredSkills.some((x) => x.toLowerCase() === s.toLowerCase()) ? "green" : "gray"}>{s}</Pill>)}</div>
                <p className="text-xs text-muted-foreground">{r.match.gaps.join(" · ") || "No gaps"}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
