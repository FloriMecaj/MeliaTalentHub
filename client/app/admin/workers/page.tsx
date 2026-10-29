"use client";

import { CheckCircle2Icon, ChevronDownIcon, DownloadIcon, PlaneIcon, PlusIcon, SendIcon, StarIcon, TagIcon, UploadIcon, UsersIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BulkBar, DataTable, type Column } from "@/components/dashboard/data-table";
import { KpiStrip, PageHeader, Pill, StatCard, type Tone } from "@/components/dashboard/parts";
import { FilterBar } from "@/components/dashboard/toolbar";
import { SelectField } from "@/components/select-field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { downloadCsv, initials, timeAgo } from "@/lib/format";
import { addTag, setWorkerStatus, useDb } from "@/lib/store";
import type { Worker, WorkerStatus } from "@/lib/types";
import { NewExchangeDialog } from "../exchange/new-dialog";
import { AddWorkerDialog, BroadcastDialog, TagDialog } from "./dialogs";
import { WorkerSheet } from "./worker-sheet";

const STATUS_TONE: Record<WorkerStatus, Tone> = { available: "gray", invited: "amber", confirmed: "green", declined: "red", exchange: "sky" };
const ALL = "all";
const STATUSES: WorkerStatus[] = ["available", "invited", "confirmed", "declined", "exchange"];

export default function WorkersPage() {
  const db = useDb();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [rating, setRating] = useState(ALL);
  const [tag, setTag] = useState(ALL);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [dlg, setDlg] = useState<"add" | "message" | "tag" | "exchange" | null>(null);

  const tags = useMemo(() => [...new Set(db.workers.flatMap((w) => w.tags))], [db.workers]);
  const rows = db.workers.filter(
    (w) =>
      `${w.name} ${w.email} ${w.phone}`.toLowerCase().includes(q.toLowerCase()) &&
      (cat === ALL || w.categoryId === cat) &&
      (status === ALL || w.status === status) &&
      (rating === ALL || w.rating >= +rating) &&
      (tag === ALL || w.tags.includes(tag)),
  );
  const active = !!q || [cat, status, rating, tag].some((v) => v !== ALL);
  const avg = db.workers.reduce((s, w) => s + w.rating, 0) / (db.workers.length || 1);
  const ids = [...selected];

  const exportCsv = (list: Worker[]) =>
    downloadCsv("workers.csv", [
      ["Name", "Email", "Phone", "Category", "Rating", "Years", "Status", "Tags"],
      ...list.map((w) => [w.name, w.email, w.phone, db.categories.find((c) => c.id === w.categoryId)?.name, w.rating, w.yearsAtMelia, w.status, w.tags.join("|")]),
    ]);

  const columns: Column<Worker>[] = [
    {
      key: "name", header: "Worker", sort: (w) => w.name,
      cell: (w) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8"><AvatarFallback className="text-xs">{initials(w.name)}</AvatarFallback></Avatar>
          <div><p className="font-medium">{w.name}</p><p className="text-xs text-muted-foreground">{w.email}</p></div>
        </div>
      ),
    },
    { key: "cat", header: "Category", sort: (w) => w.categoryId, cell: (w) => db.categories.find((c) => c.id === w.categoryId)?.name ?? "-" },
    { key: "rating", header: "Rating", sort: (w) => w.rating, cell: (w) => <span className="inline-flex items-center gap-1"><StarIcon className="size-3.5 fill-amber-400 text-amber-400" />{w.rating}</span> },
    { key: "years", header: "Years", sort: (w) => w.yearsAtMelia, cell: (w) => w.yearsAtMelia },
    { key: "status", header: "Status", sort: (w) => w.status, cell: (w) => <Pill tone={STATUS_TONE[w.status]}>{w.status}</Pill> },
    { key: "tags", header: "Tags", cell: (w) => <div className="flex flex-wrap gap-1">{w.tags.map((t) => <Pill key={t} tone="violet">{t}</Pill>)}</div> },
    { key: "last", header: "Last contact", sort: (w) => w.lastContactedAt ?? "", cell: (w) => (w.lastContactedAt ? timeAgo(w.lastContactedAt) : <span className="text-muted-foreground">never</span>) },
  ];

  return (
    <>
      <PageHeader
        title="Past workers"
        description="Your talent pool: everyone who worked at Meliá. Tag, message, invite and place them."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => exportCsv(rows)}><DownloadIcon /> Export</Button>
            <Button onClick={() => setDlg("add")}><PlusIcon /> Add / import</Button>
          </div>
        }
      />
      <KpiStrip>
        <StatCard label="Total workers" value={db.workers.length} icon={UsersIcon} />
        <StatCard label="Available" value={db.workers.filter((w) => w.status === "available").length} icon={UploadIcon} hint="ready to invite" />
        <StatCard label="Confirmed" value={db.workers.filter((w) => w.status === "confirmed").length} icon={CheckCircle2Icon} />
        <StatCard label="Avg. rating" value={avg.toFixed(1)} icon={StarIcon} hint="★ out of 5" />
      </KpiStrip>

      <FilterBar
        search={q} onSearch={setQ} placeholder="Search name, email, phone…"
        count={rows.length} total={db.workers.length} active={active}
        onClear={() => { setQ(""); setCat(ALL); setStatus(ALL); setRating(ALL); setTag(ALL); }}
      >
        <div className="w-44"><SelectField ariaLabel="Category" value={cat} onChange={setCat} options={[{ value: ALL, label: "All categories" }, ...db.categories.map((c) => ({ value: c.id, label: c.name }))]} /></div>
        <div className="w-36"><SelectField ariaLabel="Status" value={status} onChange={setStatus} options={[{ value: ALL, label: "Any status" }, ...STATUSES.map((s) => ({ value: s, label: s }))]} /></div>
        <div className="w-32"><SelectField ariaLabel="Rating" value={rating} onChange={setRating} options={[{ value: ALL, label: "Any rating" }, ...[3, 4, 5].map((n) => ({ value: String(n), label: `★ ${n}+` }))]} /></div>
        <div className="w-36"><SelectField ariaLabel="Tag" value={tag} onChange={setTag} options={[{ value: ALL, label: "Any tag" }, ...tags.map((t) => ({ value: t, label: t }))]} /></div>
      </FilterBar>

      <DataTable
        rows={rows} columns={columns} rowId={(w) => w.id} selectable selected={selected}
        onSelectedChange={setSelected} onRowClick={(w) => setOpenId(w.id)} pageSize={12}
        initialSort={{ key: "rating", dir: "desc" }}
      />

      <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
        <Button size="sm" variant="outline" onClick={() => setDlg("message")}><SendIcon /> Message</Button>
        <Button size="sm" variant="outline" onClick={() => setDlg("tag")}><TagIcon /> Tag</Button>
        <Button size="sm" variant="outline" onClick={() => setDlg("exchange")}><PlaneIcon /> Exchange</Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>Set status <ChevronDownIcon /></DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUSES.map((s) => (
              <DropdownMenuItem key={s} className="capitalize" onClick={() => { setWorkerStatus(ids, s); toast.success(`${ids.length} set to ${s}`); setSelected(new Set()); }}>{s}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="outline" onClick={() => exportCsv(db.workers.filter((w) => selected.has(w.id)))}><DownloadIcon /> Export</Button>
      </BulkBar>

      <WorkerSheet id={openId} onClose={() => setOpenId(null)} />
      <AddWorkerDialog open={dlg === "add"} onOpenChange={(o) => !o && setDlg(null)} />
      <BroadcastDialog open={dlg === "message"} onOpenChange={(o) => !o && setDlg(null)} workerIds={ids} onDone={() => setSelected(new Set())} />
      <TagDialog open={dlg === "tag"} onOpenChange={(o) => !o && setDlg(null)} onSave={(t) => { addTag(ids, t); toast.success(`Tagged ${ids.length} workers`); setSelected(new Set()); }} existing={tags} />
      {dlg === "exchange" && <NewExchangeDialog open presetWorkers={ids} onOpenChange={(o) => { if (!o) { setDlg(null); setSelected(new Set()); } }} />}
    </>
  );
}
