"use client";

import { CheckCircle2Icon, CheckCheckIcon, MessageCircleIcon, PlaneIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Empty, PageHeader, Pill } from "@/components/dashboard/parts";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/format";
import { useStudent } from "@/lib/hooks";
import { markMessageRead, respondInvitation } from "@/lib/store";

const REASONS = ["Studying abroad", "Found a year-round job", "Family reasons", "Health reasons", "Other"];

export default function StudentMessages() {
  const { db, worker } = useStudent();
  const [tab, setTab] = useState("all");
  const [declining, setDeclining] = useState<string | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [extra, setExtra] = useState("");

  const all = worker ? db.messages.filter((m) => m.workerId === worker.id) : [];
  const msgs = all.filter((m) => tab === "all" || (tab === "unread" ? !m.read : m.kind === tab));
  const unread = all.filter((m) => !m.read).length;

  return (
    <>
      <PageHeader
        title="Messages"
        description="Invitations and updates from Meliá."
        actions={unread > 0 ? <Button variant="outline" onClick={() => all.forEach((m) => !m.read && m.kind !== "invitation" && markMessageRead(m.id))}><CheckCheckIcon /> Mark updates as read</Button> : undefined}
      />
      {worker && (
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All ({all.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
              <TabsTrigger value="invitation">Invitations</TabsTrigger>
              <TabsTrigger value="exchange">Exchange</TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="text-sm text-muted-foreground">Season status: <Pill tone={worker.status === "confirmed" ? "green" : worker.status === "invited" ? "amber" : worker.status === "declined" ? "red" : "gray"}>{worker.status}</Pill></span>
        </div>
      )}
      {msgs.length === 0 && <Empty>{worker ? "Nothing here." : "No messages yet. When Meliá invites you back, it appears here."}</Empty>}
      <div className="space-y-4">
        {msgs.map((m) => (
          <Card key={m.id} className={`p-5 ${m.read ? "" : "border-primary/50"}`}>
            <div className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                {m.kind === "exchange" ? <PlaneIcon className="size-5" /> : <MessageCircleIcon className="size-5" />}
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Pill tone={m.kind === "invitation" ? "amber" : m.kind === "exchange" ? "sky" : "gray"}>{m.kind}</Pill>
                  <span>{m.channel}</span><span>{timeAgo(m.createdAt)}</span>
                  {!m.read && <Pill tone="sky">new</Pill>}
                </div>
                <p>{m.body}</p>
                {m.kind === "invitation" && worker?.status === "invited" && (
                  <div className="flex gap-2">
                    <Button onClick={() => { respondInvitation(worker.id, true); markMessageRead(m.id); toast.success("You're confirmed for the season"); }}><CheckCircle2Icon /> Accept</Button>
                    <Button variant="outline" onClick={() => { setDeclining(m.id); setExtra(""); setReason(REASONS[0]); }}>Decline</Button>
                  </div>
                )}
                {m.kind !== "invitation" && !m.read && <Button size="sm" variant="ghost" onClick={() => markMessageRead(m.id)}>Mark as read</Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!declining} onOpenChange={(o) => !o && setDeclining(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Decline the invitation</DialogTitle><DialogDescription>Let Meliá know why so they can plan. You can still apply to other jobs.</DialogDescription></DialogHeader>
          <SelectField value={reason} onChange={setReason} options={REASONS.map((r) => ({ value: r, label: r }))} />
          <Textarea rows={3} placeholder="Anything to add? (optional)" value={extra} onChange={(e) => setExtra(e.target.value)} />
          <Button variant="destructive" onClick={() => { if (worker && declining) { respondInvitation(worker.id, false, extra.trim() ? `${reason}: ${extra.trim()}` : reason); markMessageRead(declining); toast("Invitation declined"); } setDeclining(null); }}>Decline invitation</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
