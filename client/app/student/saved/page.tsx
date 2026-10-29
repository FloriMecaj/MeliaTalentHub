"use client";

import { useState } from "react";
import { Empty, PageHeader } from "@/components/dashboard/parts";
import { useStudent } from "@/lib/hooks";
import { matchJob } from "@/lib/match";
import { JobCard, type JobRow } from "../jobs/job-card";
import { JobSheet } from "../jobs/job-sheet";

export default function SavedJobs() {
  const { db, user, profile } = useStudent();
  const [open, setOpen] = useState<string | null>(null);
  if (!user) return null;
  const applied = new Set(db.applications.filter((a) => a.studentId === user.id).map((a) => a.jobId));
  const saved = new Set(profile?.savedJobIds ?? []);
  const rows: JobRow[] = db.jobs.filter((j) => saved.has(j.id)).map((job) => ({
    job, m: matchJob(profile, job), category: db.categories.find((c) => c.id === job.categoryId), applied: applied.has(job.id), saved: true,
  })).sort((a, b) => b.m.score - a.m.score);
  const sel = rows.find((r) => r.job.id === open);
  return (
    <>
      <PageHeader title="Saved jobs" description="Jobs you bookmarked to come back to." />
      {rows.length === 0 ? <Empty>Nothing saved yet. Tap the bookmark on any job.</Empty> : (
        <div className="grid gap-5 2xl:grid-cols-2">{rows.map((r) => <JobCard key={r.job.id} row={r} userId={user.id} onOpen={() => setOpen(r.job.id)} />)}</div>
      )}
      <JobSheet job={sel?.job ?? null} profile={profile} userId={user.id} applied={!!sel?.applied} categoryName={sel?.category?.name} onClose={() => setOpen(null)} />
    </>
  );
}
