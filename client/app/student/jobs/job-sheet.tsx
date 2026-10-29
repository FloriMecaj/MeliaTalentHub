"use client";

import { CheckIcon, SparklesIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { DetailSheet } from "@/components/dashboard/overlays";
import { Pill, ScoreRing } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";
import { matchJob } from "@/lib/match";
import { applyToJob, saveProfile } from "@/lib/store";
import type { Job, StudentProfile } from "@/lib/types";

export function JobSheet({
  job, profile, userId, applied, categoryName, onClose,
}: { job: Job | null; profile?: StudentProfile; userId: string; applied: boolean; categoryName?: string; onClose: () => void }) {
  if (!job) return null;
  const m = matchJob(profile, job);
  const have = new Set([...(profile?.skills ?? []), ...(profile?.languages ?? [])].map((x) => x.toLowerCase()));
  const missing = [
    ...job.requiredSkills.filter((s) => !have.has(s.toLowerCase())).map((name) => ({ name, kind: "skill" as const })),
    ...job.languages.filter((s) => !have.has(s.toLowerCase())).map((name) => ({ name, kind: "language" as const })),
  ];
  const withAll = profile && missing.length
    ? matchJob({ ...profile, skills: [...profile.skills, ...missing.filter((x) => x.kind === "skill").map((x) => x.name)], languages: [...profile.languages, ...missing.filter((x) => x.kind === "language").map((x) => x.name)] }, job).score
    : m.score;

  return (
    <DetailSheet open onOpenChange={(o) => !o && onClose()} title={job.title} description={`${categoryName} · ${job.location} · ${job.season}`}>
      <div className="flex items-center gap-4 rounded-xl border p-4">
        <ScoreRing score={m.score} size={84} />
        <div className="space-y-2 text-sm">
          <Pill tone={m.label === "Compatible" ? "green" : m.label === "Partial" ? "amber" : "red"}>{m.label}</Pill>
          {withAll > m.score && <p className="text-muted-foreground">With the missing items below you&apos;d reach <b className="text-foreground">{withAll}%</b>.</p>}
        </div>
      </div>
      <section className="space-y-2"><h3 className="text-sm font-semibold">About the role</h3><p className="text-sm text-muted-foreground">{job.description}</p></section>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-muted-foreground">Positions</dt><dd>{job.positions}</dd></div>
        <div><dt className="text-muted-foreground">Min. experience</dt><dd>{job.minExperience} years</dd></div>
        <div><dt className="text-muted-foreground">Season</dt><dd className="capitalize">{job.season}</dd></div>
        <div><dt className="text-muted-foreground">Apply by</dt><dd>{job.deadline ? fmtDate(job.deadline) : "Open"}</dd></div>
      </dl>
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Why this score</h3>
        <ul className="space-y-1 text-sm">
          {m.reasons.map((r) => <li key={r} className="flex gap-2"><CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />{r}</li>)}
          {m.gaps.map((g) => <li key={g} className="flex gap-2 text-muted-foreground"><XIcon className="mt-0.5 size-4 shrink-0 text-red-400" />{g}</li>)}
        </ul>
      </section>
      {missing.length > 0 && profile && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><SparklesIcon className="size-4 text-amber-500" />Raise your score</h3>
          <div className="flex flex-wrap gap-2">
            {missing.map((x) => (
              <Button key={x.name} size="sm" variant="outline" onClick={() => {
                saveProfile(x.kind === "skill" ? { ...profile, skills: [...profile.skills, x.name] } : { ...profile, languages: [...profile.languages, x.name] });
                toast.success(`${x.name} added to your profile`);
              }}>+ {x.name}</Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Only add what you genuinely have. Admins can see your profile.</p>
        </section>
      )}
      <Button className="h-10 w-full" disabled={applied} onClick={() => { applyToJob(userId, job.id); toast.success(`Applied to ${job.title}`); }}>{applied ? "Already applied" : "Apply now"}</Button>
    </DetailSheet>
  );
}
