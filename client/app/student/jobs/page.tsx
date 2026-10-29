"use client";

import { useState } from "react";
import { Empty, PageHeader } from "@/components/dashboard/parts";
import { FilterBar } from "@/components/dashboard/toolbar";
import { SelectField } from "@/components/select-field";
import { useStudent } from "@/lib/hooks";
import { matchJob } from "@/lib/match";
import { JobCard, type JobRow } from "./job-card";
import { JobSheet } from "./job-sheet";

const ALL = "all";

export default function StudentJobs() {
  const { db, user, profile } = useStudent();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [season, setSeason] = useState(ALL);
  const [band, setBand] = useState(ALL);
  const [sort, setSort] = useState("match");
  const [open, setOpen] = useState<string | null>(null);
  if (!user) return null;

  const applied = new Set(db.applications.filter((a) => a.studentId === user.id).map((a) => a.jobId));
  const saved = new Set(profile?.savedJobIds ?? []);
  const all: JobRow[] = db.jobs.filter((j) => j.status === "open").map((job) => ({
    job, m: matchJob(profile, job), category: db.categories.find((c) => c.id === job.categoryId),
    applied: applied.has(job.id), saved: saved.has(job.id),
  }));
  const rows = all
    .filter((r) =>
      `${r.job.title} ${r.job.description} ${r.category?.name}`.toLowerCase().includes(q.toLowerCase()) &&
      (cat === ALL || r.job.categoryId === cat) &&
      (season === ALL || r.job.season === season) &&
      (band === ALL || r.m.label === band),
    )
    .sort((a, b) => (sort === "match" ? b.m.score - a.m.score : sort === "new" ? (a.job.createdAt < b.job.createdAt ? 1 : -1) : b.job.positions - a.job.positions));
  const active = !!q || [cat, season, band].some((v) => v !== ALL);
  const sel = all.find((r) => r.job.id === open);

  return (
    <>
      <PageHeader title="Jobs & matches" description="Each announcement shows how well you fit, and why." />
      <FilterBar
        search={q} onSearch={setQ} placeholder="Search jobs…" count={rows.length} total={all.length}
        active={active} onClear={() => { setQ(""); setCat(ALL); setSeason(ALL); setBand(ALL); }}
      >
        <div className="w-44"><SelectField ariaLabel="Category" value={cat} onChange={setCat} options={[{ value: ALL, label: "All categories" }, ...db.categories.map((c) => ({ value: c.id, label: c.name }))]} /></div>
        <div className="w-36"><SelectField ariaLabel="Season" value={season} onChange={setSeason} options={[{ value: ALL, label: "Any season" }, { value: "summer", label: "Summer" }, { value: "winter", label: "Winter" }, { value: "year", label: "All year" }]} /></div>
        <div className="w-40"><SelectField ariaLabel="Match" value={band} onChange={setBand} options={[{ value: ALL, label: "Any match" }, { value: "Compatible", label: "Compatible" }, { value: "Partial", label: "Partial" }, { value: "Low", label: "Low" }]} /></div>
        <div className="w-40"><SelectField ariaLabel="Sort" value={sort} onChange={setSort} options={[{ value: "match", label: "Best match" }, { value: "new", label: "Newest" }, { value: "positions", label: "Most openings" }]} /></div>
      </FilterBar>
      {rows.length === 0 && <Empty>No jobs match these filters.</Empty>}
      <div className="grid gap-5 2xl:grid-cols-2">
        {rows.map((r) => <JobCard key={r.job.id} row={r} userId={user.id} onOpen={() => setOpen(r.job.id)} />)}
      </div>
      <JobSheet job={sel?.job ?? null} profile={profile} userId={user.id} applied={!!sel?.applied} categoryName={sel?.category?.name} onClose={() => setOpen(null)} />
    </>
  );
}
