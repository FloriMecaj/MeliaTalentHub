import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="space-y-4">
        <p className="text-sm font-semibold tracking-widest text-gold uppercase">404</p>
        <h1 className="text-3xl font-extrabold tracking-tight">This page doesn&apos;t exist</h1>
        <p className="text-muted-foreground">The page you&apos;re looking for was moved or never existed.</p>
        <Button nativeButton={false} render={<Link href="/" />}>Back to home</Button>
      </div>
    </main>
  );
}
