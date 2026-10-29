"use client";

import { BellRingIcon, ChevronDownIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Empty, Pill, type Tone } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate } from "@/lib/format";
import { backfillCampaign, followUpCampaign, useDb } from "@/lib/store";

const tone: Record<string, Tone> = { confirmed: "green", invited: "amber", declined: "red", available: "gray", exchange: "sky" };

export function Campaigns() {
  const db = useDb();
  const [open, setOpen] = useState<string | null>(null);
  if (db.campaigns.length === 0) return <Empty>No campaigns yet. Create one in the “New campaign” tab.</Empty>;

  return (
    <div className="space-y-4">
      {db.campaigns.map((c) => {
        const ws = c.workerIds.map((id) => db.workers.find((w) => w.id === id)).filter((w) => !!w);
        const n = (s: string) => ws.filter((w) => w.status === s || (s === "confirmed" && w.status === "exchange")).length;
        const conf = n("confirmed"), wait = n("invited"), dec = n("declined");
        const total = ws.length || 1;
        const toBackfill = ws.filter((w) => w.status === "declined" && !w.tags.includes("backfilled")).length;
        return (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{c.name}</CardTitle>
                  <CardDescription>{c.season} · {c.channel} · sent {fmtDate(c.createdAt)}{c.deadline ? ` · reply by ${fmtDate(c.deadline)}` : ""}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={!wait} onClick={() => toast.success(`Reminder sent to ${followUpCampaign(c.id)} workers`)}>
                    <BellRingIcon /> Follow up ({wait})
                  </Button>
                  <Button size="sm" variant="outline" disabled={!toBackfill} onClick={() => { const k = backfillCampaign(c.id); toast.success(k ? `Invited ${k} replacement${k > 1 ? "s" : ""}` : "No available replacements"); }}>
                    <RefreshCwIcon /> Backfill ({toBackfill})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="space-y-4 px-6 pb-6">
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                <div className="bg-emerald-500" style={{ width: `${(conf / total) * 100}%` }} />
                <div className="bg-amber-400" style={{ width: `${(wait / total) * 100}%` }} />
                <div className="bg-red-400" style={{ width: `${(dec / total) * 100}%` }} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span><b>{ws.length}</b> sent</span>
                <span className="text-emerald-600 dark:text-emerald-400"><b>{conf}</b> confirmed</span>
                <span className="text-amber-600 dark:text-amber-400"><b>{wait}</b> waiting</span>
                <span className="text-red-600 dark:text-red-400"><b>{dec}</b> declined</span>
                <span className="text-muted-foreground">{Math.round(((conf + dec) / total) * 100)}% replied</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setOpen(open === c.id ? null : c.id)}>
                <ChevronDownIcon className={open === c.id ? "rotate-180" : ""} /> {open === c.id ? "Hide" : "Show"} recipients
              </Button>
              {open === c.id && (
                <Table>
                  <TableHeader><TableRow><TableHead>Worker</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {ws.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell>{db.categories.find((x) => x.id === w.categoryId)?.name}</TableCell>
                        <TableCell><Pill tone={tone[w.status]}>{w.status}</Pill></TableCell>
                        <TableCell className="text-muted-foreground">{w.declineReason ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
