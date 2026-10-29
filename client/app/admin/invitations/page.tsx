"use client";

import { CheckCircle2Icon, MessageSquareIcon, SendIcon, UsersIcon, ClockIcon } from "lucide-react";
import { useState } from "react";
import { KpiStrip, PageHeader, StatCard } from "@/components/dashboard/parts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDb } from "@/lib/store";
import { Campaigns } from "./campaigns";
import { Wizard } from "./wizard";

export default function InvitationsPage() {
  const db = useDb();
  const [tab, setTab] = useState("new");
  const waiting = db.workers.filter((w) => w.status === "invited").length;
  const confirmed = db.workers.filter((w) => w.status === "confirmed").length;
  const declined = db.workers.filter((w) => w.status === "declined").length;
  const pool = db.workers.filter((w) => w.status === "available").length;
  const replied = confirmed + declined;
  const rate = replied + waiting ? Math.round((replied / (replied + waiting)) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Invitation automation"
        description="Re-invite last season's best performers: pick how many you need per category and the highest-rated are invited first."
      />
      <KpiStrip>
        <StatCard label="Available to invite" value={pool} icon={UsersIcon} hint={`${db.workers.length} workers last season`} />
        <StatCard label="Awaiting reply" value={waiting} icon={ClockIcon} />
        <StatCard label="Confirmed" value={confirmed} icon={CheckCircle2Icon} hint={`${declined} declined`} />
        <StatCard label="Response rate" value={`${rate}%`} icon={MessageSquareIcon} />
      </KpiStrip>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new"><SendIcon /> New campaign</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns ({db.campaigns.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-6"><Wizard onSent={() => setTab("campaigns")} /></TabsContent>
        <TabsContent value="campaigns" className="mt-6"><Campaigns /></TabsContent>
      </Tabs>
    </>
  );
}
