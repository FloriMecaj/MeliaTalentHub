"use client";

import { CalendarIcon, ChevronRightIcon, FileIcon } from "lucide-react";
import { useState } from "react";
import { ScoreRing } from "@/components/dashboard/parts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { fmtDate, initials } from "@/lib/format";
import { setApplicationStage } from "@/lib/store";
import { STAGE_META, type ApplicantRow } from "@/lib/stages";
import { STAGES, type Stage } from "@/lib/types";

const dot: Record<string, string> = {
  gray: "bg-slate-400", sky: "bg-sky-500", violet: "bg-violet-500",
  amber: "bg-amber-500", green: "bg-emerald-500", red: "bg-red-500",
};

export function Board({
  rows, selected, onToggle, onOpen,
}: {
  rows: ApplicantRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const [over, setOver] = useState<Stage | null>(null);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STAGES.map((stage) => {
        const col = rows.filter((r) => r.app.stage === stage).sort((a, b) => b.match.score - a.match.score);
        const meta = STAGE_META[stage];
        const next = STAGES[STAGES.indexOf(stage) + 1];
        return (
          <div
            key={stage}
            onDragOver={(e) => { e.preventDefault(); setOver(stage); }}
            onDragLeave={() => setOver((o) => (o === stage ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              const id = e.dataTransfer.getData("text/plain");
              if (id) setApplicationStage(id, stage);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors ${over === stage ? "border-primary bg-accent/50" : ""}`}
          >
            <div className="flex items-center gap-2 px-4 py-3">
              <span className={`size-2 rounded-full ${dot[meta.tone]}`} />
              <span className="text-sm font-semibold">{meta.label}</span>
              <span className="ml-auto rounded-full bg-background px-2 text-xs text-muted-foreground">{col.length}</span>
            </div>
            <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
              {col.map((r) => (
                <div
                  key={r.app.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", r.app.id)}
                  onClick={() => onOpen(r.app.id)}
                  className={`cursor-grab rounded-lg border bg-card p-3 shadow-xs transition-shadow hover:shadow-md active:cursor-grabbing ${selected.has(r.app.id) ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar className="size-8"><AvatarFallback className="text-xs">{initials(r.user?.name ?? "?")}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.user?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.job?.title}</p>
                    </div>
                    <ScoreRing score={r.match.score} size={44} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {r.profile?.cv && <span className="inline-flex items-center gap-1"><FileIcon className="size-3" />CV</span>}
                    {r.app.interviewAt && <span className="inline-flex items-center gap-1"><CalendarIcon className="size-3" />{fmtDate(r.app.interviewAt)}</span>}
                    {r.match.gaps[0] && <span className="truncate">{r.match.gaps[0]}</span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" checked={selected.has(r.app.id)} onChange={() => onToggle(r.app.id)} className="accent-sky-500" />
                      Select
                    </label>
                    {next && next !== "rejected" && stage !== "rejected" && (
                      <Button size="xs" variant="outline" onClick={() => setApplicationStage(r.app.id, next)}>
                        {STAGE_META[next].label} <ChevronRightIcon />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {col.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">Drop applicants here</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
