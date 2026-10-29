"use client";

import { useSession } from "./auth";
import { useDb } from "./store";

/** Current student's user, profile and linked past-worker record (matched by email). */
export function useStudent() {
  const session = useSession();
  const db = useDb();
  const user = db.users.find((u) => u.id === session?.userId);
  const profile = db.profiles.find((p) => p.userId === user?.id);
  const worker = db.workers.find((w) => w.email === user?.email);
  return { db, user, profile, worker };
}

export function profileCompleteness(p: ReturnType<typeof useStudent>["profile"]) {
  if (!p) return 0;
  const checks = [
    !!p.field, !!p.city, p.categoryIds.length > 0, p.skills.length > 0,
    p.languages.length > 0, !!p.about, !!p.cv,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
