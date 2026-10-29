"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "./logo";
import { endSession, useSession } from "@/lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/impact", label: "Impact & ROI" },
];

export function Navbar() {
  const pathname = usePathname();
  const session = useSession();
  const dash = session?.role === "admin" ? "/admin" : "/student";

  const cta = session ? (
    <>
      <Button variant="ghost" onClick={() => endSession()}>
        Log out
      </Button>
      <Button nativeButton={false} render={<Link href={dash} />}>
        Open {session.role === "admin" ? "admin panel" : "dashboard"}
      </Button>
    </>
  ) : (
    <>
      <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
        Log in
      </Button>
      <Button nativeButton={false} render={<Link href="/register" />}>
        Get started
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 w-full items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === l.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {cta}
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Menu" />}>
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="gap-2 p-6">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="py-2 text-lg font-medium">
                  {l.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">{cta}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
