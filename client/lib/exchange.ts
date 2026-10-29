import type { Category, DB, Exchange, Partner, Worker } from "./types";

export const X_STATUSES: Exchange["status"][] = ["proposed", "confirmed", "active", "returned", "cancelled"];
export const X_META: Record<Exchange["status"], { label: string; tone: "gray" | "sky" | "green" | "violet" | "red" }> = {
  proposed: { label: "Proposed", tone: "gray" },
  confirmed: { label: "Partner confirmed", tone: "sky" },
  active: { label: "Active", tone: "green" },
  returned: { label: "Returned", tone: "violet" },
  cancelled: { label: "Cancelled", tone: "red" },
};
export const NEXT_STATUS: Partial<Record<Exchange["status"], Exchange["status"]>> = {
  proposed: "confirmed", confirmed: "active", active: "returned",
};

export type ExchangeRow = { x: Exchange; worker?: Worker; partner?: Partner; category?: Category };

export const exchangeRows = (db: DB): ExchangeRow[] =>
  db.exchanges.map((x) => {
    const worker = db.workers.find((w) => w.id === x.workerId);
    return {
      x, worker,
      partner: db.partners.find((p) => p.id === x.partnerId),
      category: db.categories.find((c) => c.id === worker?.categoryId),
    };
  });

/** Placements that currently take up a slot at a partner. */
export const usedSlots = (db: DB, partnerId: string) =>
  db.exchanges.filter((x) => x.partnerId === partnerId && (x.status === "active" || x.status === "confirmed" || x.status === "proposed")).length;
