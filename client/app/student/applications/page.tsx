"use client";

import { CalendarIcon, CheckIcon, Undo2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/dashboard/overlays";
import { withdrawApplication } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Empty, KpiStrip, PageHeader, Pill, StatCard } from "@/components/dashboard/parts";
import { fmtDate } from "@/lib/format";
import { useStudent } from "@/lib/hooks";
import { STAGE_META } from "@/lib/stages";
import { STAGES, type Stage } from "@/lib/types";

const PATH: Stage[] = STAGES.filter((s) => s !== "rejected");

export default function StudentApplications() {
  const { db, user } = useStudent();
  const [tab, setTab] = useState("all");
  const [withdraw, setWithdraw] = useState<string | null>(null);
  const mine = db.applications.filter((a) => a.studentId === user?.id);
  const apps = mine.filter((a) => tab === "all" || (tab === "active" ? !["hired", "rejected"].includes(a.stage) : tab === "done" ? ["hired", "rejected"].includes(a.stage) : false));
  return (
    <>
      <PageHeader title="My applications" description="Follow every job you applied to through the hiring process." />
      <KpiStrip>
        <StatCard label="Applied" value={mine.length} />
        <StatCard label="In progress" value={mine.filter((a) => !["hired", "rejected"].includes(a.stage)).length} />
        <StatCard label="Interviews" value={mine.filter((a) => a.interviewAt).length} icon={CalendarIcon} />
        <StatCard label="Hired" value={mine.filter((a) => a.stage === "hired").length} icon={CheckIcon} />
      </KpiStrip>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="all">All ({mine.length})</TabsTrigger><TabsTrigger value="active">In progress</TabsTrigger><TabsTrigger value="done">Decided</TabsTrigger></TabsList>
      </Tabs>
      {apps.length === 0 ? (
        <Empty>{mine.length ? "Nothing in this tab." : "You haven't applied to anything yet. Head to Jobs & matches."}</Empty>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {apps.map((a) => {
            const idx = PATH.indexOf(a.stage);
            return (
              <Card key={a.id} className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{db.jobs.find((j) => j.id === a.jobId)?.title ?? "Removed job"}</p>
                    <p className="text-sm text-muted-foreground">Applied {fmtDate(a.createdAt)} · {a.score}% match</p>
                  </div>
                  <Pill tone={STAGE_META[a.stage].tone}>{STAGE_META[a.stage].label}</Pill>
                </div>
                {a.stage === "rejected" ? (
                  <p className="text-sm text-muted-foreground">This application wasn&apos;t successful. Keep an eye on new jobs that match you.</p>
                ) : (
                  <ol className="flex items-center gap-1">
                    {PATH.map((s, i) => (
                      <li key={s} className="flex flex-1 flex-col items-center gap-1">
                        <span className={`h-1.5 w-full rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
                        <span className={`text-[11px] ${i === idx ? "font-semibold" : "text-muted-foreground"}`}>{STAGE_META[s].label}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {!["hired", "rejected"].includes(a.stage) && (
                  <Button size="sm" variant="ghost" className="w-fit" onClick={() => setWithdraw(a.id)}><Undo2Icon /> Withdraw</Button>
                )}
                {a.interviewAt && a.stage !== "rejected" && (
                  <p className="flex items-center gap-2 rounded-lg bg-accent p-3 text-sm text-accent-foreground"><CalendarIcon className="size-4" />Interview on <b>{fmtDate(a.interviewAt)}</b></p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    <ConfirmDialog open={!!withdraw} onOpenChange={(o) => !o && setWithdraw(null)} destructive confirmLabel="Withdraw" title="Withdraw this application?" description="The admin team will no longer see it. You can apply again later." onConfirm={() => { if (withdraw) withdrawApplication(withdraw); toast("Application withdrawn"); }} />
    </>
  );
}
