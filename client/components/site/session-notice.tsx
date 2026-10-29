"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { endSession, useSession } from "@/lib/auth";
import { useDb } from "@/lib/store";

/** Shown on login/register when a session cookie already exists. */
export function SessionNotice() {
  const session = useSession();
  const db = useDb();
  const user = db.users.find((u) => u.id === session?.userId);
  if (!session || !user) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
      <p>
        You&apos;re signed in as <b>{user.name}</b> ({session.role}).
      </p>
      <div className="flex gap-2">
        <Button size="sm" nativeButton={false} render={<Link href={`/${session.role}`} />}>
          Continue
        </Button>
        <Button size="sm" variant="outline" onClick={() => endSession()}>
          Log out to switch
        </Button>
      </div>
    </div>
  );
}
