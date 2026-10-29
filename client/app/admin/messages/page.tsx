"use client";

import { MegaphoneIcon, RotateCcwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { KpiStrip, PageHeader, Pill, StatCard, type Tone } from "@/components/dashboard/parts";
import { FilterBar } from "@/components/dashboard/toolbar";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/format";
import { broadcast, useDb } from "@/lib/store";
import type { Message } from "@/lib/types";

const KIND: Record<Message["kind"], Tone> = { invitation: "amber", exchange: "sky", general: "gray" };
const ALL = "all";

export default function MessagesPage() {
  const db = useDb();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(ALL);
  const [channel, setChannel] = useState(ALL);
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState("available");
  const [body, setBody] = useState("");
  const [ch, setCh] = useState<Message["channel"]>("WhatsApp");

  const rows = db.messages.filter(
    (m) =>
      `${db.workers.find((w) => w.id === m.workerId)?.name} ${m.body}`.toLowerCase().includes(q.toLowerCase()) &&
      (kind === ALL || m.kind === kind) && (channel === ALL || m.channel === channel),
  );
  const recipients = db.workers.filter((w) => (audience === ALL ? true : audience.startsWith("cat:") ? w.categoryId === audience.slice(4) : w.status === audience));
  const unread = db.messages.filter((m) => !m.read).length;

  const columns: Column<Message>[] = [
    { key: "to", header: "To", sort: (m) => db.workers.find((w) => w.id === m.workerId)?.name ?? "", cell: (m) => <span className="font-medium">{db.workers.find((w) => w.id === m.workerId)?.name}</span> },
    { key: "kind", header: "Type", cell: (m) => <Pill tone={KIND[m.kind]}>{m.kind}</Pill> },
    { key: "ch", header: "Channel", cell: (m) => m.channel },
    { key: "body", header: "Message", cell: (m) => <span className="line-clamp-2 max-w-md text-muted-foreground">{m.body}</span> },
    { key: "at", header: "Sent", sort: (m) => m.createdAt, cell: (m) => timeAgo(m.createdAt) },
    { key: "read", header: "Seen", cell: (m) => <Pill tone={m.read ? "green" : "gray"}>{m.read ? "read" : "unread"}</Pill> },
    { key: "act", header: "", cell: (m) => <Button size="xs" variant="ghost" onClick={() => { broadcast([m.workerId], m.body, m.channel); toast.success("Message resent"); }}><RotateCcwIcon /> Resend</Button> },
  ];

  return (
    <>
      <PageHeader title="Messages" description="Everything sent to workers, plus quick broadcasts to a segment." actions={<Button onClick={() => setOpen(true)}><MegaphoneIcon /> New broadcast</Button>} />
      <KpiStrip>
        <StatCard label="Messages sent" value={db.messages.length} />
        <StatCard label="Invitations" value={db.messages.filter((m) => m.kind === "invitation").length} />
        <StatCard label="Unread by workers" value={unread} />
        <StatCard label="Campaigns" value={db.campaigns.length} />
      </KpiStrip>
      <FilterBar search={q} onSearch={setQ} placeholder="Search worker or text…" count={rows.length} total={db.messages.length} active={!!q || kind !== ALL || channel !== ALL} onClear={() => { setQ(""); setKind(ALL); setChannel(ALL); }}>
        <div className="w-40"><SelectField ariaLabel="Type" value={kind} onChange={setKind} options={[{ value: ALL, label: "All types" }, { value: "invitation", label: "Invitation" }, { value: "exchange", label: "Exchange" }, { value: "general", label: "General" }]} /></div>
        <div className="w-40"><SelectField ariaLabel="Channel" value={channel} onChange={setChannel} options={[{ value: ALL, label: "All channels" }, { value: "WhatsApp", label: "WhatsApp" }, { value: "App", label: "App" }]} /></div>
      </FilterBar>
      <DataTable rows={rows} columns={columns} rowId={(m) => m.id} initialSort={{ key: "at", dir: "desc" }} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New broadcast</DialogTitle><DialogDescription>{recipients.length} recipients. Use {"{name}"} to personalise.</DialogDescription></DialogHeader>
          <SelectField value={audience} onChange={setAudience} options={[
            { value: ALL, label: "Everyone" }, { value: "available", label: "Not yet invited" }, { value: "invited", label: "Awaiting reply" },
            { value: "confirmed", label: "Confirmed" }, { value: "exchange", label: "On exchange" },
            ...db.categories.map((c) => ({ value: `cat:${c.id}`, label: `Category: ${c.name}` })),
          ]} />
          <SelectField value={ch} onChange={(v) => setCh(v as Message["channel"])} options={[{ value: "WhatsApp", label: "WhatsApp" }, { value: "App", label: "In-app only" }]} />
          <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi {name}, …" />
          <Button disabled={!body.trim() || !recipients.length} onClick={() => { broadcast(recipients.map((w) => w.id), body.trim(), ch); toast.success(`Sent to ${recipients.length} workers`); setBody(""); setOpen(false); }}>Send to {recipients.length}</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
