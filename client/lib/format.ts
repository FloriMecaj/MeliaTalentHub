export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

export function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : fmtDate(iso);
}

export const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);

export const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function downloadCsv(filename: string, rows: (string | number | boolean | undefined)[][]) {
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const initials = (name: string) =>
  name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
