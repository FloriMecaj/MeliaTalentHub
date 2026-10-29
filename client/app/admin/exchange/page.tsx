"use client";

import { CalendarClockIcon, PlaneIcon, PlusIcon, UsersIcon, BuildingIcon, DownloadIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Empty, KpiStrip, PageHeader, StatCard } from "@/components/dashboard/parts";
import { FilterBar } from "@/components/dashboard/toolbar";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { daysUntil, downloadCsv } from "@/lib/format";
import { exchangeRows, usedSlots } from "@/lib/exchange";
import { useDb } from "@/lib/store";
import { Matching } from "./matching";
import { NewExchangeDialog } from "./new-dialog";
import { Partners } from "./partners";
import { Pipeline } from "./pipeline";
import { Timeline } from "./timeline";

export default function ExchangePage() {
  const db = useDb();
  const [tab, setTab] = useState("pipeline");
  const [q, setQ] = useState("");
  const [partner, setPartner] = useState("all");
  const [dialog, setDialog] = useState<{ open: boolean; partnerId: string }>({ open: false, partnerId: "" });

  const all = useMemo(() => exchangeRows(db), [db]);
  const rows = all.filter(
    (r) =>
      `${r.worker?.name} ${r.partner?.name}`.toLowerCase().includes(q.toLowerCase()) &&
      (partner === "all" || r.x.partnerId === partner),
  );
  const active = all.filter((r) => r.x.status === "active").length;
  const pending = all.filter((r) => r.x.status === "proposed" || r.x.status === "confirmed").length;
  const ending = all.filter((r) => r.x.status === "active" && daysUntil(r.x.to) >= 0 && daysUntil(r.x.to) <= 14).length;
  const cap = db.partners.reduce((s, p) => s + p.capacity, 0);
  const used = db.partners.reduce((s, p) => s + usedSlots(db, p.id), 0);

  return (
    <>
      <PageHeader
        title="Exchange programs"
        description="Place workers you don't need this winter at partner companies. They return next season."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => downloadCsv("exchanges.csv", [["Worker", "Partner", "From", "To", "Status", "Salary", "Housing", "Transport"], ...all.map((r) => [r.worker?.name, r.partner?.name, r.x.from, r.x.to, r.x.status, r.x.salary, r.x.housing, r.x.transport])])}>
              <DownloadIcon /> Export
            </Button>
            <Button onClick={() => setDialog({ open: true, partnerId: "" })}><PlusIcon /> New exchange</Button>
          </div>
        }
      />
      <KpiStrip>
        <StatCard label="Active placements" value={active} icon={PlaneIcon} />
        <StatCard label="Awaiting partner" value={pending} icon={UsersIcon} hint="proposed or confirmed" />
        <StatCard label="Returning in 14 days" value={ending} icon={CalendarClockIcon} />
        <StatCard label="Partner capacity" value={`${used}/${cap}`} icon={BuildingIcon} hint={`${db.partners.length} companies`} />
      </KpiStrip>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
        </TabsList>

        {(tab === "pipeline" || tab === "timeline") && (
          <div className="mt-6">
            <FilterBar
              search={q} onSearch={setQ} placeholder="Search worker or partner…"
              count={rows.length} total={all.length} active={!!q || partner !== "all"} onClear={() => { setQ(""); setPartner("all"); }}
            >
              <div className="w-52"><SelectField ariaLabel="Partner" value={partner} onChange={setPartner} options={[{ value: "all", label: "All partners" }, ...db.partners.map((p) => ({ value: p.id, label: p.name }))]} /></div>
            </FilterBar>
          </div>
        )}

        <TabsContent value="pipeline" className="mt-6">{all.length ? <Pipeline rows={rows} /> : <Empty>No exchanges yet. Create one with “New exchange”.</Empty>}</TabsContent>
        <TabsContent value="timeline" className="mt-6"><Timeline rows={rows} /></TabsContent>
        <TabsContent value="partners" className="mt-6"><Partners onAssign={(partnerId) => setDialog({ open: true, partnerId })} /></TabsContent>
        <TabsContent value="matching" className="mt-6"><Matching rows={all} /></TabsContent>
      </Tabs>

      {dialog.open && (
        <NewExchangeDialog
          key={dialog.partnerId}
          open
          presetPartner={dialog.partnerId}
          onOpenChange={(o) => !o && setDialog({ open: false, partnerId: "" })}
        />
      )}
    </>
  );
}
