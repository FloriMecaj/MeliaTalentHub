"use client";

import { BookmarkIcon, CheckIcon, MapPinIcon, UsersIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Pill, ScoreRing } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDate } from "@/lib/format";
import type { MatchResult } from "@/lib/match";
import { applyToJob, toggleSavedJob } from "@/lib/store";
import type { Category, Job } from "@/lib/types";

export type JobRow = { job: Job; m: MatchResult; category?: Category; applied: boolean; saved: boolean };

export function JobCard({ row, userId, onOpen }: { row: JobRow; userId: string; onOpen: () => void }) {
  const { job, m, category, applied, saved } = row;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <ScoreRing score={m.score} size={84} />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{category?.name}</span>
              <span className="inline-flex items-center gap-1"><MapPinIcon className="size-3" />{job.location}</span>
              <span className="capitalize">{job.season}</span>
              <span className="inline-flex items-center gap-1"><UsersIcon className="size-3" />{job.positions} open</span>
            </CardDescription>
            <div className="mt-2">
              <Pill tone={m.label === "Compatible" ? "green" : m.label === "Partial" ? "amber" : "red"}>
                {m.label === "Compatible" ? "You're compatible" : m.label === "Partial" ? "Partially compatible" : "Not a good fit yet"}
              </Pill>
            </div>
          </div>
          <Button
            size="icon-sm" variant="ghost" aria-label={saved ? "Remove from saved" : "Save job"}
            onClick={() => { toggleSavedJob(userId, job.id); toast(saved ? "Removed from saved" : "Saved for later"); }}
          >
            <BookmarkIcon className={saved ? "fill-primary text-primary" : ""} />
          </Button>
        </div>
      </CardHeader>
      <div className="space-y-4 px-6 pb-6">
        <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
        <ul className="space-y-1 text-sm">
          {m.reasons.slice(0, 3).map((r) => <li key={r} className="flex gap-2"><CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />{r}</li>)}
          {m.gaps.slice(0, 2).map((g) => <li key={g} className="flex gap-2 text-muted-foreground"><XIcon className="mt-0.5 size-4 shrink-0 text-red-400" />{g}</li>)}
        </ul>
        {job.deadline && <p className="text-xs text-muted-foreground">Apply by {fmtDate(job.deadline)}</p>}
        <div className="flex gap-2">
          <Button disabled={applied} onClick={() => { applyToJob(userId, job.id); toast.success(`Applied to ${job.title}`); }}>{applied ? "Applied" : "Apply"}</Button>
          <Button variant="outline" onClick={onOpen}>Details</Button>
        </div>
      </div>
    </Card>
  );
}
