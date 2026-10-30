"use client";

import Link from "next/link";
import {
  BriefcaseBusinessIcon, CalendarClockIcon, ChevronRightIcon, FileCheckIcon, MessageSquareIcon,
  PlaneIcon, PlusIcon, UsersIcon,
} from "lucide-react";
import { useAdminAlerts } from "@/components/dashboard/notifications";
import { BarList, KpiStrip, PageHeader, ScoreRing, StatCard } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { daysUntil, fmtDate, timeAgo } from "@/lib/format";
import { STAGE_META } from "@/lib/stages";
import { useDb } from "@/lib/store";
import { STAGES } from "@/lib/types";

const actions = [
  { href: "/admin/jobs", label: "Post a job", icon: BriefcaseBusinessIcon },
  { href: "/admin/applicants", label: "Review applicants", icon: FileCheckIcon },
  { href: "/admin/invitations", label: "Send invitations", icon: MessageSquareIcon },
  { href: "/admin/exchange", label: "New exchange", icon: PlaneIcon },
  { href: "/admin/workers", label: "Add workers", icon: PlusIcon },
];

export default function AdminOverview() {
  const db = useDb();
  const alerts = useAdminAlerts();
  const w = (s: string) => db.workers.filter((x) => x.status === s).length;
  const secured = w("confirmed") + w("exchange");
  const target = db.categories.reduce((s, c) => s + (c.target ?? 0), 0);
  const replied = w("confirmed") + w("declined");

  const upcoming = [
    ...db.applications.filter((a) => a.interviewAt && daysUntil(a.interviewAt) >= 0).map((a) => ({
      id: a.id, date: a.interviewAt!, text: `Interview: ${db.users.find((u) => u.id === a.studentId)?.name}`, href: "/admin/applicants",
    })),
    ...db.exchanges.filter((x) => x.status === "active" && daysUntil(x.to) >= 0).map((x) => ({
      id: x.id, date: x.to, text: `${db.workers.find((wk) => wk.id === x.workerId)?.name} returns from ${db.partners.find((p) => p.id === x.partnerId)?.name}`, href: "/admin/exchange",
    })),
    ...db.exchanges.filter((x) => x.status === "confirmed" || x.status === "proposed").map((x) => ({
      id: x.id, date: x.from, text: `${db.workers.find((wk) => wk.id === x.workerId)?.name} starts at ${db.partners.find((p) => p.id === x.partnerId)?.name}`, href: "/admin/exchange",
    })),
  ].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 6);

  const byCategory = db.categories.map((c) => {
    const jobIds = db.jobs.filter((j) => j.categoryId === c.id).map((j) => j.id);
    return { label: c.name, value: db.applications.filter((a) => jobIds.includes(a.jobId)).length };
  });

  return (
    <>
      <PageHeader title="Dashboard" description="Your workforce pipeline, retention and mobility at a glance." />

      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button key={a.href} variant="outline" nativeButton={false} render={<Link href={a.href} />}><a.icon /> {a.label}</Button>
        ))}
      </div>

      <KpiStrip>
        <StatCard label="Open jobs" value={db.jobs.filter((j) => j.status === "open").length} icon={BriefcaseBusinessIcon} hint={`${db.jobs.reduce((s, j) => s + j.positions, 0)} positions`} />
        <StatCard label="Applicants" value={db.applications.length} icon={UsersIcon} hint={`${db.applications.filter((a) => a.stage === "new").length} new to review`} />
        <StatCard label="Secured for next season" value={`${secured}${target ? `/${target}` : ""}`} icon={FileCheckIcon} hint={target ? `${Math.round((secured / target) * 100)}% of target` : "set targets in Categories"} />
        <StatCard label="On exchange" value={w("exchange")} icon={PlaneIcon} hint={`${db.partners.length} partner companies`} />
      </KpiStrip>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Needs attention</CardTitle><CardDescription>{alerts.length ? `${alerts.length} things waiting for you` : "All caught up"}</CardDescription></CardHeader>
          <div className="space-y-2 px-6 pb-6">
            {alerts.map((a) => (
              <Link key={a.id} href={a.href} className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted">
                {a.text}<ChevronRightIcon className="size-4 text-muted-foreground" />
              </Link>
            ))}
            {alerts.length === 0 && <p className="text-sm text-muted-foreground">Nothing needs your attention right now.</p>}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Hiring funnel</CardTitle><CardDescription>Applicants by stage</CardDescription></CardHeader>
          <div className="px-6 pb-6"><BarList color="bg-sky-500" rows={STAGES.map((s) => ({ label: STAGE_META[s].label, value: db.applications.filter((a) => a.stage === s).length }))} /></div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Invitation funnel</CardTitle><CardDescription>Last season&apos;s {db.workers.length} workers</CardDescription></CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <BarList color="bg-amber-500" rows={[
              { label: "Not yet invited", value: w("available") }, { label: "Awaiting reply", value: w("invited") },
              { label: "Confirmed", value: w("confirmed") }, { label: "Declined", value: w("declined") }, { label: "On exchange", value: w("exchange") },
            ]} />
            <p className="text-sm text-muted-foreground">Response rate: <b className="text-foreground">{replied + w("invited") ? Math.round((replied / (replied + w("invited"))) * 100) : 0}%</b></p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Upcoming</CardTitle><CardDescription>Interviews, starts and returns</CardDescription></CardHeader>
          <div className="space-y-2 px-6 pb-6">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
            {upcoming.map((u) => (
              <Link key={u.id + u.date} href={u.href} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm hover:bg-muted">
                <span className="flex items-center gap-2"><CalendarClockIcon className="size-4 text-muted-foreground" />{u.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{fmtDate(u.date)}</span>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Applications by category</CardTitle></CardHeader>
          <div className="px-6 pb-6"><BarList color="bg-violet-500" rows={byCategory} /></div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <div className="space-y-3 px-6 pb-6">
            {db.activity.slice(0, 7).map((a) => (
              <div key={a.id} className="flex gap-3 text-sm"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" /><div><p>{a.text}</p><p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p></div></div>
            ))}
            {db.activity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Returning workforce by category</CardTitle><CardDescription>Confirmed or placed vs your headcount target (or last season&apos;s team size).</CardDescription></CardHeader>
        <div className="grid grid-cols-2 gap-6 px-6 pb-6 sm:grid-cols-3 xl:grid-cols-6">
          {db.categories.map((c) => {
            const team = db.workers.filter((x) => x.categoryId === c.id);
            const sec = team.filter((x) => x.status === "confirmed" || x.status === "exchange").length;
            const goal = c.target || team.length;
            const pct = goal ? Math.min(100, Math.round((sec / goal) * 100)) : 0;
            return (
              <div key={c.id} className="flex flex-col items-center gap-3 rounded-xl border p-5 text-center">
                <ScoreRing score={pct} size={96} color={c.color ?? "#c2652a"} />
                <div><p className="font-semibold">{c.name}</p><p className="text-xs text-muted-foreground">{sec} of {goal} secured</p></div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
