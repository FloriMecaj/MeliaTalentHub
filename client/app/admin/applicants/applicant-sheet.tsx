"use client";

import { CheckIcon, FileIcon, MailIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { DetailSheet } from "@/components/dashboard/overlays";
import { Pill, ScoreRing } from "@/components/dashboard/parts";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, timeAgo } from "@/lib/format";
import { addApplicationNote, setApplicationStage, setInterview, useDb } from "@/lib/store";
import { buildRows, STAGE_META } from "@/lib/stages";
import { STAGES, type Stage } from "@/lib/types";

export function ApplicantSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const db = useDb();
  const row = id ? buildRows(db).find((r) => r.app.id === id) : undefined;
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  if (!row) return <DetailSheet open={false} onOpenChange={onClose} title="">{null}</DetailSheet>;
  const { app, user, profile, job, match } = row;
  const others = db.applications.filter((a) => a.studentId === app.studentId && a.id !== app.id);
  const have = new Set((profile?.skills ?? []).map((s) => s.toLowerCase()));

  return (
    <DetailSheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={user?.name ?? "Applicant"}
      description={`${job?.title ?? "Removed job"} · applied ${timeAgo(app.createdAt)}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Pill tone={STAGE_META[app.stage].tone}>{STAGE_META[app.stage].label}</Pill>
        <div className="w-44">
          <SelectField
            ariaLabel="Move to stage"
            value={app.stage}
            onChange={(v) => { setApplicationStage(app.id, v as Stage); toast.success(`Moved to ${STAGE_META[v as Stage].label}`); }}
            options={STAGES.map((s) => ({ value: s, label: STAGE_META[s].label }))}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" disabled={app.stage === "hired"} onClick={() => { setApplicationStage(app.id, "hired"); toast.success("Marked as hired"); }}>
            <CheckIcon /> Hire
          </Button>
          <Button size="sm" variant="destructive" disabled={app.stage === "rejected"} onClick={() => { setApplicationStage(app.id, "rejected"); toast("Applicant rejected"); }}>
            <XIcon /> Reject
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">AI match</h3>
        <div className="flex items-start gap-4 rounded-xl border p-4">
          <ScoreRing score={match.score} size={80} />
          <ul className="space-y-1 text-sm">
            {match.reasons.map((r) => <li key={r} className="flex gap-2"><CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />{r}</li>)}
            {match.gaps.map((g) => <li key={g} className="flex gap-2 text-muted-foreground"><XIcon className="mt-0.5 size-4 shrink-0 text-red-400" />{g}</li>)}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Profile</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted-foreground">Does</dt><dd className="capitalize">{profile?.occupation} · {profile?.field}</dd></div>
          <div><dt className="text-muted-foreground">City</dt><dd>{profile?.city}</dd></div>
          <div><dt className="text-muted-foreground">Experience</dt><dd>{profile?.experienceYears} {profile?.experienceYears === 1 ? "year" : "years"}</dd></div>
          <div><dt className="text-muted-foreground">Availability</dt><dd className="capitalize">{profile?.availability}</dd></div>
        </dl>
        <div className="flex flex-wrap gap-1.5">
          {profile?.skills.map((s) => (
            <Pill key={s} tone={job?.requiredSkills.some((r) => r.toLowerCase() === s.toLowerCase()) ? "green" : "gray"}>{s}</Pill>
          ))}
          {job?.requiredSkills.filter((r) => !have.has(r.toLowerCase())).map((r) => <Pill key={r} tone="red">missing: {r}</Pill>)}
        </div>
        <p className="text-sm text-muted-foreground">Languages: {profile?.languages.join(", ") || "-"}</p>
        {profile?.about && <p className="text-sm">{profile.about}</p>}
        <div className="flex flex-wrap gap-2">
          {profile?.cv ? (
            profile.cv.dataUrl ? (
              <Button size="sm" variant="outline" nativeButton={false} render={<a href={profile.cv.dataUrl} download={profile.cv.name} />}>
                <FileIcon /> {profile.cv.name}
              </Button>
            ) : <Pill tone="sky"><FileIcon className="mr-1 size-3" />{profile.cv.name}</Pill>
          ) : <Pill>No CV</Pill>}
          {user && (
            <Button size="sm" variant="outline" nativeButton={false} render={<a href={`mailto:${user.email}`} />}>
              <MailIcon /> {user.email}
            </Button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Interview</h3>
        {app.interviewAt && <p className="text-sm">Scheduled for <b>{fmtDate(app.interviewAt)}</b></p>}
        <div className="flex gap-2">
          <div className="flex-1"><DatePicker value={date} onChange={setDate} placeholder="Pick interview date" /></div>
          <Button disabled={!date} onClick={() => { setInterview(app.id, date); toast.success("Interview scheduled"); setDate(""); }}>Schedule</Button>
          {app.interviewAt && <Button variant="outline" onClick={() => setInterview(app.id, undefined)}>Clear</Button>}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Internal notes</h3>
        <Textarea rows={2} placeholder="Only admins see this…" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button size="sm" disabled={!note.trim()} onClick={() => { addApplicationNote(app.id, note.trim()); setNote(""); }}>Add note</Button>
        <ul className="space-y-2">
          {app.notes.map((n) => (
            <li key={n.id} className="rounded-lg bg-muted p-3 text-sm">{n.text}<span className="block text-xs text-muted-foreground">{timeAgo(n.at)}</span></li>
          ))}
        </ul>
      </section>

      {others.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Also applied to</h3>
          {others.map((o) => (
            <p key={o.id} className="flex items-center justify-between text-sm">
              {db.jobs.find((j) => j.id === o.jobId)?.title}
              <Pill tone={STAGE_META[o.stage].tone}>{STAGE_META[o.stage].label}</Pill>
            </p>
          ))}
        </section>
      )}
    </DetailSheet>
  );
}
