"use client";

import { useSyncExternalStore } from "react";
import { seedDb, upgradeDb } from "./seed";
import { matchJob } from "./match";
import type {
  Application, Campaign, Category, DB, Exchange, Job, Message, MessageTemplate,
  Partner, Stage, StudentProfile, User, Worker, WorkerStatus,
} from "./types";

const KEY = "melia.db";
const SEED: DB = seedDb();

let cacheRaw: string | null = null;
let cacheDb: DB = SEED;
const listeners = new Set<() => void>();

function read(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cacheRaw && cacheRaw !== null) return cacheDb;
    if (raw === null) {
      const seeded = JSON.stringify(SEED);
      localStorage.setItem(KEY, seeded);
      cacheRaw = seeded;
      cacheDb = SEED;
      return cacheDb;
    }
    const parsed = JSON.parse(raw) as DB;
    if (upgradeDb(parsed)) {
      const upgraded = JSON.stringify(parsed);
      localStorage.setItem(KEY, upgraded);
      cacheRaw = upgraded;
    } else cacheRaw = raw;
    cacheDb = parsed;
  } catch {
    // storage unavailable: fall back to the in-memory db
  }
  return cacheDb;
}

export function mutate(fn: (db: DB) => DB) {
  const next = fn(structuredClone(read()));
  const raw = JSON.stringify(next);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    // quota exceeded or blocked; keep in memory
  }
  cacheRaw = raw;
  cacheDb = next;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDb(): DB {
  return useSyncExternalStore(subscribe, read, () => SEED);
}

export function getDb(): DB {
  return read();
}

export const uid = (p: string) => `${p}-${crypto.randomUUID().slice(0, 8)}`;
const now = () => new Date().toISOString();

function log(db: DB, text: string) {
  db.activity.unshift({ id: uid("act"), at: now(), text });
  db.activity = db.activity.slice(0, 100);
}

// ---------- backup / reset ----------
export const exportDb = () => JSON.stringify(read(), null, 2);

export function importDb(json: string) {
  const parsed = JSON.parse(json) as DB;
  if (!Array.isArray(parsed.users) || !Array.isArray(parsed.workers)) throw new Error("Not a Talent Hub backup");
  upgradeDb(parsed);
  mutate(() => parsed);
}

export const resetDemo = () => mutate(() => seedDb());

// ---------- users / profiles ----------
export function addUser(user: User, profile?: StudentProfile) {
  mutate((db) => {
    db.users.push(user);
    if (profile) db.profiles.push(profile);
    log(db, `${user.name} registered as ${user.role}`);
    return db;
  });
}

export function saveProfile(profile: StudentProfile) {
  mutate((db) => {
    const i = db.profiles.findIndex((p) => p.userId === profile.userId);
    if (i >= 0) db.profiles[i] = profile;
    else db.profiles.push(profile);
    return db;
  });
}

export const toggleSavedJob = (userId: string, jobId: string) =>
  mutate((db) => {
    const p = db.profiles.find((x) => x.userId === userId);
    if (!p) return db;
    const saved = new Set(p.savedJobIds ?? []);
    if (saved.has(jobId)) saved.delete(jobId);
    else saved.add(jobId);
    p.savedJobIds = [...saved];
    return db;
  });

export const withdrawApplication = (id: string) =>
  mutate((db) => {
    const a = db.applications.find((x) => x.id === id);
    if (a) log(db, `${db.users.find((u) => u.id === a.studentId)?.name} withdrew an application`);
    db.applications = db.applications.filter((x) => x.id !== id);
    return db;
  });

// ---------- categories / jobs / partners ----------
export const saveCategory = (c: Omit<Category, "id"> & { id?: string }) =>
  mutate((db) => {
    const i = db.categories.findIndex((x) => x.id === c.id);
    if (i >= 0) db.categories[i] = { ...db.categories[i], ...c } as Category;
    else db.categories.push({ ...c, id: uid("cat") });
    log(db, `Category “${c.name}” ${i >= 0 ? "updated" : "created"}`);
    return db;
  });

export const deleteCategory = (id: string) =>
  mutate((db) => {
    db.categories = db.categories.filter((c) => c.id !== id);
    return db;
  });

export const moveCategory = (id: string, dir: -1 | 1) =>
  mutate((db) => {
    const i = db.categories.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= db.categories.length) return db;
    [db.categories[i], db.categories[j]] = [db.categories[j], db.categories[i]];
    return db;
  });

export const addJob = (j: Omit<Job, "id" | "createdAt" | "status">) =>
  mutate((db) => {
    db.jobs.unshift({ ...j, id: uid("j"), status: "open", createdAt: now() });
    log(db, `Job “${j.title}” posted`);
    return db;
  });

export const updateJob = (id: string, patch: Partial<Job>) =>
  mutate((db) => {
    const j = db.jobs.find((x) => x.id === id);
    if (j) Object.assign(j, patch);
    return db;
  });

export const duplicateJob = (id: string) =>
  mutate((db) => {
    const j = db.jobs.find((x) => x.id === id);
    if (!j) return db;
    db.jobs.unshift({ ...j, id: uid("j"), title: `${j.title} (copy)`, status: "open", createdAt: now() });
    log(db, `Job “${j.title}” duplicated`);
    return db;
  });

export const setJobStatus = (id: string, status: Job["status"]) =>
  mutate((db) => {
    const j = db.jobs.find((x) => x.id === id);
    if (j) {
      j.status = status;
      log(db, `Job “${j.title}” ${status === "open" ? "reopened" : "closed"}`);
    }
    return db;
  });

export const deleteJob = (id: string) =>
  mutate((db) => {
    db.jobs = db.jobs.filter((j) => j.id !== id);
    db.applications = db.applications.filter((a) => a.jobId !== id);
    return db;
  });

export const addPartner = (p: Omit<Partner, "id">) =>
  mutate((db) => {
    db.partners.push({ ...p, id: uid("p") });
    log(db, `Partner ${p.name} added`);
    return db;
  });

export const updatePartner = (id: string, patch: Partial<Partner>) =>
  mutate((db) => {
    const p = db.partners.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    return db;
  });

// ---------- applications ----------
const statusOf = (stage: Stage): Application["status"] =>
  stage === "hired" ? "accepted" : stage === "rejected" ? "rejected" : "pending";

export function applyToJob(studentId: string, jobId: string) {
  mutate((db) => {
    if (db.applications.some((a) => a.jobId === jobId && a.studentId === studentId)) return db;
    const job = db.jobs.find((j) => j.id === jobId);
    if (!job) return db;
    const profile = db.profiles.find((p) => p.userId === studentId);
    db.applications.push({
      id: uid("a"), jobId, studentId,
      score: matchJob(profile, job).score,
      stage: "new", status: "pending", notes: [], createdAt: now(),
    });
    log(db, `${db.users.find((u) => u.id === studentId)?.name} applied to ${job.title}`);
    return db;
  });
}

export const setApplicationStage = (ids: string | string[], stage: Stage) =>
  mutate((db) => {
    const set = new Set(Array.isArray(ids) ? ids : [ids]);
    let n = 0;
    for (const a of db.applications) {
      if (!set.has(a.id)) continue;
      a.stage = stage;
      a.status = statusOf(stage);
      n++;
    }
    if (n) log(db, `${n} applicant${n > 1 ? "s" : ""} moved to ${stage}`);
    return db;
  });

export const addApplicationNote = (id: string, text: string) =>
  mutate((db) => {
    db.applications.find((a) => a.id === id)?.notes.unshift({ id: uid("n"), text, at: now() });
    return db;
  });

export const setInterview = (id: string, date: string | undefined) =>
  mutate((db) => {
    const a = db.applications.find((x) => x.id === id);
    if (!a) return db;
    a.interviewAt = date;
    if (date && (a.stage === "new" || a.stage === "screening")) {
      a.stage = "interview";
      a.status = "pending";
    }
    if (date) log(db, `Interview scheduled for ${db.users.find((u) => u.id === a.studentId)?.name} on ${date}`);
    return db;
  });

// ---------- workers ----------
export const setWorkerStatus = (ids: string | string[], status: WorkerStatus) =>
  mutate((db) => {
    const set = new Set(Array.isArray(ids) ? ids : [ids]);
    db.workers.forEach((w) => set.has(w.id) && (w.status = status));
    return db;
  });

export const updateWorker = (id: string, patch: Partial<Worker>) =>
  mutate((db) => {
    const w = db.workers.find((x) => x.id === id);
    if (w) Object.assign(w, patch);
    return db;
  });

export const addTag = (ids: string[], tag: string) =>
  mutate((db) => {
    db.workers.forEach((w) => ids.includes(w.id) && !w.tags.includes(tag) && w.tags.push(tag));
    return db;
  });

export const addWorkers = (rows: Omit<Worker, "id" | "status" | "tags" | "notes">[]) =>
  mutate((db) => {
    rows.forEach((r) => db.workers.push({ ...r, id: uid("w"), status: "available", tags: [], notes: "" }));
    log(db, `${rows.length} worker${rows.length > 1 ? "s" : ""} added`);
    return db;
  });

/** Best-ranked available workers in a category: rating, then years at Meliá. */
export function rankPool(workers: Worker[], categoryId: string) {
  return workers
    .filter((w) => w.categoryId === categoryId && w.status === "available")
    .sort((a, b) => b.rating - a.rating || b.yearsAtMelia - a.yearsAtMelia);
}

export function renderTemplate(
  tpl: string, w: Pick<Worker, "name">, category: string, season: string, deadline = "",
) {
  return tpl
    .replaceAll("{name}", w.name.split(" ")[0])
    .replaceAll("{category}", category)
    .replaceAll("{season}", season)
    .replaceAll("{deadline}", deadline || "the deadline");
}

// ---------- campaigns / invitations ----------
export function sendCampaign(input: {
  name: string; season: string; channel: Message["channel"]; template: string;
  deadline?: string; workerIds: string[];
}) {
  const id = uid("c");
  mutate((db) => {
    const campaign: Campaign = { ...input, id, createdAt: now() };
    db.campaigns.unshift(campaign);
    for (const wid of input.workerIds) {
      const w = db.workers.find((x) => x.id === wid);
      if (!w) continue;
      const category = db.categories.find((c) => c.id === w.categoryId)?.name ?? "";
      w.status = "invited";
      w.lastContactedAt = now();
      db.messages.unshift({
        id: uid("m"), workerId: wid, channel: input.channel, kind: "invitation", campaignId: id,
        body: renderTemplate(input.template, w, category, input.season, input.deadline),
        createdAt: now(), read: false,
      });
    }
    log(db, `Campaign “${input.name}” sent to ${input.workerIds.length} workers`);
    return db;
  });
  return id;
}

/** Reminder to everyone in the campaign who has not replied. */
export function followUpCampaign(campaignId: string) {
  let n = 0;
  mutate((db) => {
    const c = db.campaigns.find((x) => x.id === campaignId);
    if (!c) return db;
    for (const wid of c.workerIds) {
      const w = db.workers.find((x) => x.id === wid);
      if (!w || w.status !== "invited") continue;
      w.lastContactedAt = now();
      db.messages.unshift({
        id: uid("m"), workerId: wid, channel: c.channel, kind: "general", campaignId,
        body: `Reminder: ${w.name.split(" ")[0]}, your spot for ${c.season} is still open. Please reply${c.deadline ? ` by ${c.deadline}` : ""}.`,
        createdAt: now(), read: false,
      });
      n++;
    }
    if (n) log(db, `Follow-up sent to ${n} workers (${c.name})`);
    return db;
  });
  return n;
}

/** For each unreplaced decline in the campaign, invite the next-best available worker in the same category. */
export function backfillCampaign(campaignId: string) {
  let n = 0;
  mutate((db) => {
    const c = db.campaigns.find((x) => x.id === campaignId);
    if (!c) return db;
    const declined = c.workerIds
      .map((id) => db.workers.find((w) => w.id === id))
      .filter((w): w is Worker => !!w && w.status === "declined" && !w.tags.includes("backfilled"));
    for (const d of declined) {
      const next = rankPool(db.workers, d.categoryId)[0];
      if (!next) continue;
      const category = db.categories.find((x) => x.id === next.categoryId)?.name ?? "";
      next.status = "invited";
      next.lastContactedAt = now();
      c.workerIds.push(next.id);
      db.messages.unshift({
        id: uid("m"), workerId: next.id, channel: c.channel, kind: "invitation", campaignId,
        body: renderTemplate(c.template, next, category, c.season, c.deadline),
        createdAt: now(), read: false,
      });
      d.tags.push("backfilled");
      n++;
    }
    if (n) log(db, `Backfilled ${n} declined spot${n > 1 ? "s" : ""} (${c.name})`);
    return db;
  });
  return n;
}

export const respondInvitation = (workerId: string, accept: boolean, reason?: string) =>
  mutate((db) => {
    const w = db.workers.find((x) => x.id === workerId);
    if (!w) return db;
    w.status = accept ? "confirmed" : "declined";
    w.declineReason = accept ? undefined : reason;
    log(db, `${w.name} ${accept ? "accepted" : "declined"} the invitation`);
    return db;
  });

export const markMessageRead = (id: string) =>
  mutate((db) => {
    const m = db.messages.find((x) => x.id === id);
    if (m) m.read = true;
    return db;
  });

// ---------- message templates / settings ----------
export const saveTemplate = (t: Omit<MessageTemplate, "id"> & { id?: string }) =>
  mutate((db) => {
    const i = db.templates.findIndex((x) => x.id === t.id);
    if (i >= 0) db.templates[i] = { ...db.templates[i], ...t };
    else db.templates.push({ ...t, id: uid("t") });
    return db;
  });

export const deleteTemplate = (id: string) =>
  mutate((db) => {
    db.templates = db.templates.filter((t) => t.id !== id);
    return db;
  });

export const setSeason = (season: string) =>
  mutate((db) => {
    db.settings.season = season;
    return db;
  });

export const broadcast = (workerIds: string[], body: string, channel: Message["channel"]) =>
  mutate((db) => {
    for (const id of workerIds) {
      const w = db.workers.find((x) => x.id === id);
      if (!w) continue;
      w.lastContactedAt = now();
      db.messages.unshift({
        id: uid("m"), workerId: id, channel, kind: "general", body: body.replaceAll("{name}", w.name.split(" ")[0]),
        createdAt: now(), read: false,
      });
    }
    log(db, `Message broadcast to ${workerIds.length} workers`);
    return db;
  });

// ---------- exchange programs ----------
export function createExchanges(
  workerIds: string[],
  e: Omit<Exchange, "id" | "createdAt" | "status" | "workerId"> & { status?: Exchange["status"] },
) {
  mutate((db) => {
    const p = db.partners.find((x) => x.id === e.partnerId);
    if (!p) return db;
    const status = e.status ?? "active";
    for (const wid of workerIds) {
      const w = db.workers.find((x) => x.id === wid);
      if (!w) continue;
      if (status === "active" || status === "confirmed") w.status = "exchange";
      db.exchanges.unshift({ ...e, workerId: wid, id: uid("x"), status, createdAt: now() });
      db.messages.unshift({
        id: uid("m"), workerId: wid, channel: "App", kind: "exchange",
        body: `Hi ${w.name.split(" ")[0]}, you've been placed at ${p.name} (${p.city}) from ${e.from} to ${e.to}. You return to Meliá Durrës next season.`,
        createdAt: now(), read: false,
      });
    }
    log(db, `${workerIds.length} worker${workerIds.length > 1 ? "s" : ""} assigned to ${p.name}`);
    return db;
  });
}

export const setExchangeStatus = (id: string, status: Exchange["status"]) =>
  mutate((db) => {
    const x = db.exchanges.find((e) => e.id === id);
    if (!x) return db;
    x.status = status;
    const w = db.workers.find((worker) => worker.id === x.workerId);
    if (w) {
      if (status === "active" || status === "confirmed") w.status = "exchange";
      if (status === "returned") w.status = "confirmed";
      if (status === "cancelled") w.status = "available";
    }
    log(db, `Exchange for ${w?.name} marked ${status}`);
    return db;
  });

export const returnExchange = (id: string) => setExchangeStatus(id, "returned");

export const extendExchange = (id: string, to: string) =>
  mutate((db) => {
    const x = db.exchanges.find((e) => e.id === id);
    if (x) {
      x.to = to;
      log(db, `Exchange extended to ${to}`);
    }
    return db;
  });
