"use client";

import Link from "next/link";
import {
  ArrowRightIcon, BusIcon, CalendarIcon, CheckCircle2Icon, FileCheckIcon,
  HomeIcon, InboxIcon, PlaneIcon, PlusIcon, SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { KpiStrip, PageHeader, Pill, ScoreRing, StatCard } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { eur, fmtDate, timeAgo } from "@/lib/format";
import { profileCompleteness, useStudent } from "@/lib/hooks";
import { boosters, profileChecklist } from "@/lib/insights";
import { matchJob } from "@/lib/match";
import { STAGE_META } from "@/lib/stages";
import { applyToJob, saveProfile } from "@/lib/store";

const JOURNEY = ["Registered", "Invited", "Confirmed", "Winter exchange", "Back next season"] as const;

export default function StudentOverview() {
  const { db, user, profile, worker } = useStudent();
  if (!user) return null;

  const open = db.jobs.filter((j) => j.status === "open");
  const matches = open.map((job) => ({ job, m: matchJob(profile, job) })).sort((a, b) => b.m.score - a.m.score);
  const apps = db.applications.filter((a) => a.studentId === user.id);
  const applied = new Set(apps.map((a) => a.jobId));
  const msgs = worker ? db.messages.filter((m) => m.workerId === worker.id) : [];
  const unread = msgs.filter((m) => !m.read);
  const exchange = worker ? db.exchanges.find((x) => x.workerId === worker.id && (x.status === "active" || x.status === "confirmed" || x.status === "proposed")) : undefined;
  const partner = db.partners.find((p) => p.id === exchange?.partnerId);
  const complete = profileCompleteness(profile);
  const list = profileChecklist(profile);
  const tips = boosters(profile, db.jobs);
  const interview = apps.filter((a) => a.interviewAt).sort((a, b) => (a.interviewAt! < b.interviewAt! ? -1 : 1))[0];

  // journey position from season status (returning staff) or application progress
  const journeyIdx = !worker ? -1 : worker.status === "invited" ? 1 : worker.status === "confirmed" ? 2 : worker.status === "exchange" ? 3 : 0;

  const next =
    worker?.status === "invited" ? { text: "You're invited back to Meliá Durrës. Confirm your spot.", cta: "Respond now", href: "/student/messages" }
    : complete < 100 ? { text: `Your profile is ${complete}% complete. A fuller profile gives sharper matches.`, cta: complete < 60 ? "Complete profile" : "Finish profile", href: "/student/profile" }
    : apps.length === 0 && matches[0] ? { text: `Your best match is ${matches[0].job.title} (${matches[0].m.score}%).`, cta: "See jobs", href: "/student/jobs" }
    : interview ? { text: `Interview on ${fmtDate(interview.interviewAt)}. Good luck!`, cta: "View application", href: "/student/applications" }
    : { text: "You're all set. We'll notify you when something changes.", cta: "Browse jobs", href: "/student/jobs" };

  return (
    <>
      <PageHeader title="Overview" description="Here's where your career at Meliá stands." />

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-sky-500 to-sky-700 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-widest text-sky-100 uppercase">Your next step</p>
            <p className="mt-1 text-xl font-bold text-balance">{next.text}</p>
          </div>
          <Button variant="secondary" size="lg" className="h-11 px-6" nativeButton={false} render={<Link href={next.href} />}>
            {next.cta} <ArrowRightIcon />
          </Button>
        </div>
      </Card>

      <KpiStrip>
        <StatCard label="Compatible jobs" value={matches.filter((x) => x.m.label === "Compatible").length} icon={SparklesIcon} hint={`of ${open.length} open`} />
        <StatCard label="Applications" value={apps.length} icon={FileCheckIcon} hint={`${apps.filter((a) => a.stage === "interview").length} in interview · ${apps.filter((a) => a.stage === "hired").length} hired`} />
        <StatCard label="Unread messages" value={unread.length} icon={InboxIcon} />
        <StatCard label="Season status" value={<span className="text-2xl capitalize">{worker?.status ?? "New"}</span>} icon={PlaneIcon} hint={worker ? "from last season's team" : "apply to get started"} />
      </KpiStrip>

      {worker && (
        <Card>
          <CardHeader><CardTitle>Your 12-month journey</CardTitle><CardDescription>From summer at Meliá, through winter, and back.</CardDescription></CardHeader>
          <ol className="grid gap-3 px-6 pb-6 sm:grid-cols-5">
            {JOURNEY.map((s, i) => (
              <li key={s} className="space-y-2">
                <div className={`h-1.5 rounded-full ${i <= journeyIdx ? "bg-primary" : "bg-muted"}`} />
                <p className={`flex items-center gap-1.5 text-sm ${i === journeyIdx ? "font-semibold" : i < journeyIdx ? "" : "text-muted-foreground"}`}>
                  {i < journeyIdx && <CheckCircle2Icon className="size-4 text-emerald-500" />}{s}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Best matches for you</CardTitle><CardDescription>Ranked by AI compatibility with your profile.</CardDescription></div>
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/student/jobs" />}>All jobs</Button>
              </div>
            </CardHeader>
            <div className="space-y-3 px-6 pb-6">
              {matches.slice(0, 4).map(({ job, m }) => (
                <div key={job.id} className="flex items-center gap-4 rounded-xl border p-4">
                  <ScoreRing score={m.score} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{job.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{db.categories.find((c) => c.id === job.categoryId)?.name} · {job.location} · <span className="capitalize">{job.season}</span></p>
                    {m.gaps[0] && <p className="truncate text-xs text-muted-foreground">{m.gaps[0]}</p>}
                  </div>
                  <Pill tone={m.label === "Compatible" ? "green" : m.label === "Partial" ? "amber" : "red"}>{m.label}</Pill>
                  <Button size="sm" disabled={applied.has(job.id)} onClick={() => { applyToJob(user.id, job.id); toast.success(`Applied to ${job.title}`); }}>
                    {applied.has(job.id) ? "Applied" : "Apply"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><SparklesIcon className="size-4 text-amber-500" />Boost your matches</CardTitle><CardDescription>Add one of these to your profile and watch your scores rise.</CardDescription></CardHeader>
            <div className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
              {tips.length === 0 && <p className="text-sm text-muted-foreground">Nothing to suggest. Your profile covers what open jobs ask for.</p>}
              {tips.map((t) => (
                <div key={t.name} className="flex items-center justify-between gap-3 rounded-xl border p-4">
                  <div>
                    <p className="font-semibold">{t.name} <span className="text-xs font-normal text-muted-foreground">{t.kind}</span></p>
                    <p className="text-xs text-muted-foreground">{t.unlocks ? `Makes ${t.unlocks} more job${t.unlocks > 1 ? "s" : ""} compatible` : `+${t.gain} match points across jobs`}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (!profile) return;
                    saveProfile(t.kind === "skill" ? { ...profile, skills: [...profile.skills, t.name] } : { ...profile, languages: [...profile.languages, t.name] });
                    toast.success(`${t.name} added to your profile`);
                  }}><PlusIcon /> Add</Button>
                </div>
              ))}
            </div>
          </Card>

          {apps.length > 0 && (
            <Card>
              <CardHeader><CardTitle>My applications</CardTitle></CardHeader>
              <div className="space-y-2 px-6 pb-6">
                {apps.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span><b>{db.jobs.find((j) => j.id === a.jobId)?.title}</b><span className="block text-xs text-muted-foreground">Applied {timeAgo(a.createdAt)}{a.interviewAt ? ` · interview ${fmtDate(a.interviewAt)}` : ""}</span></span>
                    <Pill tone={STAGE_META[a.stage].tone}>{STAGE_META[a.stage].label}</Pill>
                  </div>
                ))}
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/student/applications" />}>View all</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Profile strength</CardTitle></CardHeader>
            <div className="space-y-3 px-6 pb-6">
              <div className="flex items-end justify-between"><span className="text-3xl font-extrabold">{complete}%</span></div>
              <Progress value={complete} />
              <ul className="space-y-1.5 text-sm">
                {list.map((c) => (
                  <li key={c.label} className={`flex items-center gap-2 ${c.done ? "text-muted-foreground line-through" : ""}`}>
                    <CheckCircle2Icon className={`size-4 ${c.done ? "text-emerald-500" : "text-muted-foreground/40"}`} />{c.label}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/student/profile" />}>Edit profile</Button>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Winter exchange</CardTitle><CardDescription>Your off-season placement.</CardDescription></CardHeader>
            <div className="px-6 pb-6 text-sm">
              {exchange && partner ? (
                <div className="space-y-3">
                  <div><p className="text-lg font-semibold">{partner.name}</p><p className="text-muted-foreground">{partner.city} · {partner.type}</p></div>
                  <p className="flex items-center gap-2"><CalendarIcon className="size-4 text-muted-foreground" />{fmtDate(exchange.from)} → {fmtDate(exchange.to)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="green">{eur.format(exchange.salary)}/month</Pill>
                    {exchange.housing && <Pill tone="sky"><HomeIcon className="mr-1 size-3" />housing</Pill>}
                    {exchange.transport && <Pill tone="sky"><BusIcon className="mr-1 size-3" />transport</Pill>}
                    <Pill tone={exchange.status === "active" ? "green" : "amber"}>{exchange.status}</Pill>
                  </div>
                  {exchange.notes && <p className="text-muted-foreground">{exchange.notes}</p>}
                  <p className="text-xs text-muted-foreground">You return to Meliá Durrës next season.</p>
                </div>
              ) : <p className="text-muted-foreground">No exchange assigned yet. If Meliá places you at a partner company this winter, it will show here.</p>}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Latest messages</CardTitle></CardHeader>
            <div className="space-y-2 px-6 pb-6">
              {msgs.slice(0, 3).map((m) => (
                <Link key={m.id} href="/student/messages" className={`block rounded-lg border p-3 text-sm hover:bg-muted ${m.read ? "" : "border-primary/50"}`}>
                  <span className="line-clamp-2">{m.body}</span><span className="text-xs text-muted-foreground">{m.channel} · {timeAgo(m.createdAt)}</span>
                </Link>
              ))}
              {msgs.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
