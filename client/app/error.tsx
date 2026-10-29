"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">An unexpected error happened. Your data is safe in this browser.</p>
        <div className="flex justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>Go home</Button>
        </div>
      </div>
    </main>
  );
}
