"use client";

import { DownloadIcon, PrinterIcon } from "lucide-react";
import { useState } from "react";
import { BarList, KpiStrip, PageHeader, ScoreRing, StatCard } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { downloadCsv, eur } from "@/lib/format";
import { buildRows } from "@/lib/stages";
import { useDb } from "@/lib/store";

export default function ReportsPage() {
  const db = useDb();
  const [fee, setFee] = useState(400);
  const rows = buildRows(db);
  const secured = db.workers.filter((w) => w.status === "confirmed" || w.status === "exchange").length;
  const hired = rows.filter((r) => r.app.stage === "hired").length;
  const target = db.categories.reduce((s, c) => s + (c.target ?? 0), 0);
  const placements = secured + hired;
  const agencyCost = placements * fee;
  const ours = agencyCost * 0.5;
  const replied = db.workers.filter((w) => w.status === "confirmed" || w.status === "declined" || w.status === "exchange").length;
  const contacted = db.workers.filter((w) => w.lastContactedAt).length;
  const activeX = db.exchanges.filter((x) => x.status === "active" || x.status === "confirmed");
  const payroll = activeX.reduce((s, x) => s + x.salary, 0);

  return (
    <>
      <PageHeader
        title="Reports"
        description={`${db.settings.season} season summary and savings.`}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={() => downloadCsv("season-summary.csv", [["Metric", "Value"], ["Season", db.settings.season], ["Workers last season", db.workers.length], ["Secured", secured], ["Applicants", db.applications.length], ["Hired", hired], ["Placements", placements], ["Agency cost avoided (EUR)", agencyCost - ours]])}><DownloadIcon /> Export CSV</Button>
            <Button onClick={() => window.print()}><PrinterIcon /> Print</Button>
          </div>
        }
      />
      <KpiStrip>
        <StatCard label="Placements" value={placements} hint={`${secured} returning + ${hired} hired`} />
        <StatCard label="Target reached" value={target ? `${Math.min(100, Math.round((placements / target) * 100))}%` : "-"} hint={target ? `${placements} of ${target}` : "set targets in Categories"} />
        <StatCard label="Invitation response" value={`${contacted ? Math.round((replied / contacted) * 100) : 0}%`} hint={`${replied} of ${contacted} replied`} />
        <StatCard label="Exchange payroll" value={eur.format(payroll)} hint="per month, active placements" />
      </KpiStrip>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Savings vs agencies</CardTitle><CardDescription>Based on {placements} placements this season.</CardDescription></CardHeader>
          <div className="space-y-5 px-6 pb-6">
            <div className="space-y-2">
              <Label htmlFor="fee">Typical agency fee per hire: <b>{eur.format(fee)}</b></Label>
              <input id="fee" type="range" min={100} max={1000} step={50} value={fee} onChange={(e) => setFee(+e.target.value)} className="w-full accent-sky-500 print:hidden" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Agency cost</p><p className="text-xl font-bold">{eur.format(agencyCost)}</p></div>
              <div className="rounded-xl bg-accent p-3"><p className="text-xs text-accent-foreground">Talent Hub (50%)</p><p className="text-xl font-bold text-accent-foreground">{eur.format(ours)}</p></div>
              <div className="rounded-xl bg-emerald-500/10 p-3"><p className="text-xs text-muted-foreground">Saved</p><p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{eur.format(agencyCost - ours)}</p></div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Target vs secured</CardTitle><CardDescription>Per category</CardDescription></CardHeader>
          <div className="grid grid-cols-3 gap-4 px-6 pb-6">
            {db.categories.map((c) => {
              const sec = db.workers.filter((w) => w.categoryId === c.id && (w.status === "confirmed" || w.status === "exchange")).length;
              const goal = c.target || 1;
              return <div key={c.id} className="flex flex-col items-center text-center"><ScoreRing score={Math.min(100, Math.round((sec / goal) * 100))} size={64} color={c.color ?? "#c2652a"} /><p className="mt-1 text-xs font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{sec}/{c.target ?? 0}</p></div>;
            })}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Worker ratings</CardTitle><CardDescription>Quality of your talent pool</CardDescription></CardHeader>
          <div className="px-6 pb-6"><BarList color="bg-amber-500" rows={[5, 4, 3, 2, 1].map((n) => ({ label: `★ ${n}`, value: db.workers.filter((w) => w.rating === n).length }))} /></div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Exchange benefits</CardTitle></CardHeader>
          <div className="px-6 pb-6"><BarList color="bg-sky-500" rows={[
            { label: "Active/confirmed placements", value: activeX.length },
            { label: "With housing", value: activeX.filter((x) => x.housing).length },
            { label: "With transport", value: activeX.filter((x) => x.transport).length },
            { label: "Returned this season", value: db.exchanges.filter((x) => x.status === "returned").length },
          ]} /></div>
        </Card>
      </div>
    </>
  );
}
