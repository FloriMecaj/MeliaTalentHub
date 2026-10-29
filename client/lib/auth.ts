"use client";

import { useSyncExternalStore } from "react";
import { addUser, getDb, uid } from "./store";
import type { Role, StudentProfile, User } from "./types";

const COOKIE = "melia_session";

export type Session = { userId: string; role: Role } | null;

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function writeCookie(value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${COOKIE}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  window.dispatchEvent(new Event("melia-session"));
}

function readCookie(): string {
  return document.cookie.split("; ").find((r) => r.startsWith(`${COOKIE}=`))?.split("=")[1] ?? "";
}

export function startSession(user: User) {
  writeCookie(`${user.id}.${user.role}`, 7);
}

export function endSession() {
  writeCookie("", -1);
}

export function useSession(): Session {
  const raw = useSyncExternalStore(
    (cb) => {
      window.addEventListener("melia-session", cb);
      return () => window.removeEventListener("melia-session", cb);
    },
    readCookie,
    () => "",
  );
  if (!raw) return null;
  const [userId, role] = raw.split(".");
  return role === "admin" || role === "student" ? { userId, role } : null;
}

/** true once running in the browser (avoids redirects during SSR/hydration) */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useCurrentUser(): User | undefined {
  const s = useSession();
  const db = getDb();
  return s ? db.users.find((u) => u.id === s.userId) : undefined;
}

export async function login(email: string, password: string, role: Role) {
  const hash = await sha256(password);
  const user = getDb().users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === role,
  );
  if (!user || user.passwordHash !== hash) return null;
  startSession(user);
  return user;
}

export async function register(
  input: { name: string; email: string; password: string; role: Role },
  profile?: Omit<StudentProfile, "userId">,
) {
  const email = input.email.trim().toLowerCase();
  if (getDb().users.some((u) => u.email.toLowerCase() === email)) return null;
  const user: User = {
    id: uid("u"), role: input.role, name: input.name.trim(), email,
    passwordHash: await sha256(input.password),
    createdAt: new Date().toISOString(),
  };
  addUser(user, profile ? { ...profile, userId: user.id } : undefined);
  startSession(user);
  return user;
}
