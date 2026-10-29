"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { daysUntil, timeAgo } from "@/lib/format";
import { useDb } from "@/lib/store";

type Alert = { id: string; text: string; href: string; at?: string };

export function useAdminAlerts(): Alert[] {
  const db = useDb();
  const out: Alert[] = [];
  const pending = db.applications.filter((a) => a.stage === "new").length;
  if (pending) out.push({ id: "new", text: `${pending} new applicant${pending > 1 ? "s" : ""} to review`, href: "/admin/applicants" });
  const waiting = db.workers.filter((w) => w.status === "invited").length;
  if (waiting) out.push({ id: "wait", text: `${waiting} invitation${waiting > 1 ? "s" : ""} awaiting a reply`, href: "/admin/invitations" });
  const declined = db.workers.filter((w) => w.status === "declined" && !w.tags.includes("backfilled")).length;
  if (declined) out.push({ id: "dec", text: `${declined} declined spot${declined > 1 ? "s" : ""} to backfill`, href: "/admin/invitations" });
  db.exchanges
    .filter((x) => x.status === "active" && daysUntil(x.to) <= 14 && daysUntil(x.to) >= 0)
    .forEach((x) =>
      out.push({
        id: x.id,
        text: `${db.workers.find((w) => w.id === x.workerId)?.name} returns in ${daysUntil(x.to)} days`,
        href: "/admin/exchange",
      }),
    );
  const upcoming = db.applications.filter((a) => a.interviewAt && daysUntil(a.interviewAt) >= 0 && daysUntil(a.interviewAt) <= 7);
  if (upcoming.length) out.push({ id: "int", text: `${upcoming.length} interview${upcoming.length > 1 ? "s" : ""} this week`, href: "/admin/applicants" });
  return out;
}

export function NotificationBell() {
  const alerts = useAdminAlerts();
  const db = useDb();
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" aria-label="Notifications" className="relative" />}
      >
        <BellIcon />
        {alerts.length > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {alerts.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3 text-sm font-semibold">Needs attention</div>
        <div className="max-h-72 overflow-y-auto">
          {alerts.length === 0 && <p className="p-4 text-sm text-muted-foreground">All caught up.</p>}
          {alerts.map((a) => (
            <Link key={a.id} href={a.href} className="block border-b px-4 py-3 text-sm last:border-0 hover:bg-muted">
              {a.text}
            </Link>
          ))}
        </div>
        <div className="border-t px-4 py-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Recent activity</p>
          {db.activity.slice(0, 3).map((x) => (
            <p key={x.id} className="text-xs text-muted-foreground">{x.text} · {timeAgo(x.at)}</p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
