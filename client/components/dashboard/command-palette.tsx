"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Command } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useDb } from "@/lib/store";
import type { NavItem } from "./shell";

/** Cmd/Ctrl+K: jump to any page, worker, applicant or job. */
export function CommandPalette({ items, role }: { items: NavItem[]; role: "admin" | "student" }) {
  const router = useRouter();
  const db = useDb();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        className="hidden h-9 w-56 justify-start gap-2 px-3 font-normal text-muted-foreground md:flex"
        onClick={() => setOpen(true)}
      >
        <SearchIcon /> Search…
        <kbd className="ml-auto rounded border bg-muted px-1.5 text-[10px]">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => setOpen(true)}>
        <SearchIcon />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Jump to a page or record">
        <Command>
          <CommandInput placeholder="Search pages, workers, applicants, jobs…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Pages">
              {items.map((it) => (
                <CommandItem key={it.href} value={`page ${it.label}`} onSelect={() => go(it.href)}>
                  <it.icon /> {it.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {role === "admin" && (
              <>
                <CommandGroup heading="Workers">
                  {db.workers.slice(0, 60).map((w) => (
                    <CommandItem key={w.id} value={`worker ${w.name} ${w.email}`} onSelect={() => go("/admin/workers")}>
                      {w.name} <span className="text-xs text-muted-foreground capitalize">{w.status}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Applicants">
                  {db.applications.map((a) => {
                    const u = db.users.find((x) => x.id === a.studentId);
                    const j = db.jobs.find((x) => x.id === a.jobId);
                    return (
                      <CommandItem key={a.id} value={`applicant ${u?.name} ${j?.title}`} onSelect={() => go("/admin/applicants")}>
                        {u?.name} <span className="text-xs text-muted-foreground">{j?.title}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandGroup heading="Jobs">
                  {db.jobs.map((j) => (
                    <CommandItem key={j.id} value={`job ${j.title}`} onSelect={() => go("/admin/jobs")}>
                      {j.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
