import type { ComponentType, ReactNode } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({
  label, value, hint, icon: Icon,
}: { label: string; value: ReactNode; hint?: string; icon?: ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <CardTitle className="text-3xl font-extrabold tracking-tight">{value}</CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  );
}

export function BarList({
  rows, color = "bg-primary",
}: { rows: { label: string; value: number; sub?: string }[]; color?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{r.label}</span>
            <span className="font-semibold">{r.sub ?? r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScoreRing({
  score, size = 72, color: fixed, label,
}: { score: number; size?: number; color?: string; label?: string }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const color = fixed ?? (score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444");
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} className="stroke-muted" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} stroke={color} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <span className={`absolute inset-0 grid place-items-center font-bold ${size < 56 ? "text-[11px]" : "text-sm"}`}>{label ?? `${score}%`}</span>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">{children}</div>;
}

export function KpiStrip({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

const tones = {
  green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  red: "bg-red-500/15 text-red-700 dark:text-red-400",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  gray: "bg-muted text-muted-foreground",
} as const;
export type Tone = keyof typeof tones;

export function Pill({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}
