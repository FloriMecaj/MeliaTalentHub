import {
  BellIcon, BriefcaseBusinessIcon, FileCheckIcon, InboxIcon, LayoutDashboardIcon, MessageSquareIcon,
  PlaneIcon, SearchIcon, UsersIcon,
} from "lucide-react";
import type { ReactNode } from "react";

/* Static, non-interactive previews of the real dashboards. */

const wrap = "pointer-events-none select-none rounded-2xl border bg-card shadow-2xl shadow-sky-500/10";

function Ring({ v, size = 44, color = "#10b981" }: { v: number; size?: number; color?: string }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} className="stroke-muted" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} stroke={color} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold">{v}%</span>
    </div>
  );
}

function Chip({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "amber" | "sky" | "violet" | "red" }) {
  const t = {
    gray: "bg-muted text-muted-foreground", green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400", sky: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    violet: "bg-violet-500/15 text-violet-700 dark:text-violet-400", red: "bg-red-500/15 text-red-700 dark:text-red-400",
  }[tone];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${t}`}>{children}</span>;
}

/** Whole-dashboard preview used in the hero. */
export function DashboardMock() {
  const nav = [
    [LayoutDashboardIcon, "Overview", true], [BriefcaseBusinessIcon, "Jobs & matches"], [FileCheckIcon, "My applications"],
    [InboxIcon, "Messages"],
  ] as const;
  return (
    <div className={`${wrap} overflow-hidden`} aria-hidden>
      <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400" /><span className="size-2.5 rounded-full bg-amber-400" /><span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 flex-1 rounded-md bg-muted px-3 py-1 text-[10px] text-muted-foreground">melia-talent-hub / student</span>
      </div>
      <div className="grid grid-cols-[150px_1fr]">
        <div className="space-y-1 border-r bg-sidebar p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold"><span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-sky-400 to-amber-400 text-[10px] text-white">M</span>Talent Hub</div>
          {nav.map(([Icon, label, active]) => (
            <div key={label} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${active ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground"}`}><Icon className="size-3.5" />{label}</div>
          ))}
        </div>
        <div className="space-y-3 p-4">
          <div className="rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 p-3 text-white">
            <p className="text-[9px] font-semibold tracking-widest text-sky-100 uppercase">Your next step</p>
            <p className="text-xs font-bold">You&apos;re invited back to Meliá Durrës</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["Compatible jobs", "4"], ["Applications", "2"], ["Season", "Invited"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border p-2"><p className="text-[9px] text-muted-foreground">{l}</p><p className="text-sm font-extrabold">{v}</p></div>
            ))}
          </div>
          {[["Receptionist", "Front Office", 100], ["Waiter / Waitress", "Food & Beverage", 85]].map(([t, c, s]) => (
            <div key={t as string} className="flex items-center gap-3 rounded-lg border p-2">
              <Ring v={s as number} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{t}</p><p className="text-[10px] text-muted-foreground">{c}</p></div><Chip tone="green">Compatible</Chip>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchMock() {
  return (
    <div className={`${wrap} space-y-4 p-5`} aria-hidden>
      <div className="flex items-start gap-4">
        <Ring v={92} size={84} />
        <div className="space-y-1"><p className="font-bold">Receptionist</p><p className="text-xs text-muted-foreground">Front Office · Meliá Durrës · All year</p><Chip tone="green">You&apos;re compatible</Chip></div>
      </div>
      <ul className="space-y-1.5 text-xs">
        {["Matches the field you want to work in", "3/3 required skills", "Speaks all required languages"].map((x) => <li key={x} className="flex gap-2"><span className="text-emerald-500">✓</span>{x}</li>)}
        <li className="flex gap-2 text-muted-foreground"><span className="text-red-400">✕</span>Missing: Italian</li>
      </ul>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs"><b>Raise your score</b><div className="mt-2 flex gap-2"><Chip tone="amber">+ Italian</Chip><span className="text-muted-foreground">→ 100% match</span></div></div>
    </div>
  );
}

export function BoardMock() {
  const cols: [string, string, [string, number][]][] = [
    ["New", "bg-slate-400", [["Elona H.", 100], ["Aldo P.", 85]]],
    ["Interview", "bg-violet-500", [["Silvana B.", 100], ["Kristian D.", 90]]],
    ["Hired", "bg-emerald-500", [["Mirela Z.", 78]]],
  ];
  return (
    <div className={`${wrap} p-4`} aria-hidden>
      <div className="mb-3 flex items-center gap-2"><div className="flex flex-1 items-center gap-2 rounded-md border px-2 py-1 text-[10px] text-muted-foreground"><SearchIcon className="size-3" />Search applicants…</div><Chip tone="sky">Board</Chip></div>
      <div className="grid grid-cols-3 gap-2">
        {cols.map(([name, dot, cards]) => (
          <div key={name} className="space-y-2 rounded-lg bg-muted/50 p-2">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold"><span className={`size-1.5 rounded-full ${dot}`} />{name}</p>
            {cards.map(([n, s]) => (
              <div key={n} className="flex items-center gap-2 rounded-md border bg-card p-2"><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{n}</p><p className="text-[9px] text-muted-foreground">CV · Receptionist</p></div><Ring v={s} size={32} /></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function InviteMock() {
  const rows: [string, number, number][] = [["Housekeeping", 40, 60], ["Food & Beverage", 30, 50], ["Kitchen", 20, 40], ["Front Office", 10, 20]];
  return (
    <div className={`${wrap} grid gap-4 p-5 sm:grid-cols-[1.2fr_1fr]`} aria-hidden>
      <div className="space-y-3">
        <div><p className="text-sm font-bold">How many do you need?</p><p className="text-xs text-muted-foreground">Selected <b className="text-foreground">100</b> of 200 available</p></div>
        {rows.map(([n, v, max]) => (
          <div key={n} className="space-y-1"><div className="flex justify-between text-[11px]"><span>{n}</span><b>{v}</b></div><div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-sky-500" style={{ width: `${(v / max) * 100}%` }} /></div></div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#e7ddd3] p-3 dark:bg-slate-800">
        <p className="mb-2 text-center text-[9px] font-semibold text-muted-foreground">WHATSAPP</p>
        <div className="rounded-xl rounded-tr-sm bg-[#d9fdd3] p-2.5 text-[11px] text-slate-900">Hi Elira, thank you for your great work last season! We&apos;d love to have you back in Housekeeping for Summer 2027.<span className="mt-1 block text-right text-[9px] text-slate-500">now ✓✓</span></div>
      </div>
    </div>
  );
}

export function ExchangeMock() {
  const bars: [string, string, number, number, string][] = [
    ["Gent H.", "Sierra Nevada", 5, 55, "bg-emerald-500"], ["Lara B.", "Vienna", 12, 45, "bg-emerald-500"],
    ["Anisa M.", "Dubai Marina", 30, 55, "bg-sky-500"],
  ];
  return (
    <div className={`${wrap} p-4`} aria-hidden>
      <div className="mb-2 grid grid-cols-[90px_1fr] text-[10px] text-muted-foreground"><span /><div className="flex">{["Nov", "Dec", "Jan", "Feb", "Mar"].map((m) => <span key={m} className="flex-1 border-l pl-1">{m}</span>)}</div></div>
      {bars.map(([n, p, left, w, c]) => (
        <div key={n} className="grid grid-cols-[90px_1fr] items-center border-t py-2"><div><p className="text-[11px] font-semibold">{n}</p><p className="text-[9px] text-muted-foreground">{p}</p></div>
          <div className="relative h-5"><div className={`absolute h-5 rounded-md ${c}`} style={{ left: `${left}%`, width: `${w - left / 3}%` }} /></div></div>
      ))}
      <div className="mt-3 flex gap-2 border-t pt-3"><Chip tone="green">€1,400/mo</Chip><Chip tone="sky">housing</Chip><Chip tone="sky">transport</Chip><Chip tone="amber">returns next season</Chip></div>
    </div>
  );
}

export function AnalyticsMock() {
  return (
    <div className={`${wrap} space-y-3 p-5`} aria-hidden>
      <div className="grid grid-cols-3 gap-2">
        {[["Applicants", "13"], ["Secured", "10/45"], ["On exchange", "3"]].map(([l, v]) => <div key={l} className="rounded-lg border p-2"><p className="text-[9px] text-muted-foreground">{l}</p><p className="text-base font-extrabold">{v}</p></div>)}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="space-y-2">{[["Not invited", 23, "bg-amber-500"], ["Awaiting", 4, "bg-amber-500"], ["Confirmed", 7, "bg-emerald-500"], ["Declined", 3, "bg-red-400"]].map(([l, v, c]) => (
          <div key={l as string} className="space-y-0.5"><div className="flex justify-between text-[10px]"><span>{l}</span><b>{v}</b></div><div className="h-1.5 rounded-full bg-muted"><div className={`h-full rounded-full ${c}`} style={{ width: `${((v as number) / 23) * 100}%` }} /></div></div>
        ))}</div>
        <div className="flex flex-col items-center gap-1"><Ring v={22} size={64} color="#0ea5e9" /><p className="text-[10px] text-muted-foreground">of target</p></div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-2 text-[11px]"><BellIcon className="size-3.5 text-amber-600" />3 declined spots to backfill</div>
    </div>
  );
}

export function PhoneNotice() {
  return (
    <div className={`${wrap} p-4`} aria-hidden>
      <div className="flex items-center gap-2 text-xs font-semibold"><MessageSquareIcon className="size-4 text-primary" />Messages<Chip tone="sky">new</Chip></div>
      <p className="mt-2 text-xs text-muted-foreground">Hi Demo, we&apos;d love to have you back in Front Office for Summer 2027. Reply by 20 Nov.</p>
      <div className="mt-3 flex gap-2"><span className="rounded-md bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground">Accept</span><span className="rounded-md border px-3 py-1 text-[11px]">Decline</span></div>
    </div>
  );
}

export { Chip, UsersIcon, PlaneIcon };
