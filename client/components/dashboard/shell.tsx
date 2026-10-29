"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentType } from "react";
import { LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "./command-palette";
import { NotificationBell } from "./notifications";
import { endSession, useHydrated, useSession } from "@/lib/auth";
import { useDb } from "@/lib/store";
import type { Role } from "@/lib/types";

export type NavItem = {
  group?: string;
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
};

export function DashboardShell({
  role, items, children,
}: {
  role: Role;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const hydrated = useHydrated();
  const db = useDb();
  const user = db.users.find((u) => u.id === session?.userId);
  const allowed = session?.role === role && !!user;

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/login");
  }, [hydrated, allowed, router]);

  if (!allowed || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const root = items[0].href;
  const groups = items.reduce<{ label: string; items: NavItem[] }[]>((acc, it) => {
    const label = it.group ?? (role === "admin" ? "Administrator" : "Student");
    const g = acc.find((x) => x.label === label);
    if (g) g.items.push(it);
    else acc.push({ label, items: [it] });
    return acc;
  }, []);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href={root} className="flex h-10 items-center gap-2.5 px-1 font-bold tracking-tight">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-amber-400 text-sm font-extrabold text-white">
              M
            </span>
            <span className="truncate group-data-[collapsible=icon]:hidden">
              Meliá <span className="font-medium text-muted-foreground">Talent Hub</span>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((g) => (
            <SidebarGroup key={g.label}>
              <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {g.items.map((it) => {
                    const active = it.href === root ? pathname === root : pathname.startsWith(it.href);
                    return (
                      <SidebarMenuItem key={it.href}>
                        <SidebarMenuButton isActive={active} tooltip={it.label} render={<Link href={it.href} />}>
                          <it.icon />
                          <span>{it.label}</span>
                        </SidebarMenuButton>
                        {!!it.badge && <SidebarMenuBadge>{it.badge}</SidebarMenuBadge>}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <Separator orientation="vertical" className="h-5" />
          <p className="truncate text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user.name}</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <CommandPalette items={items} role={role} />
            {role === "admin" && <NotificationBell />}
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 px-2" />}>
                <Avatar className="size-7"><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
                <span className="hidden text-sm font-medium sm:block">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    endSession();
                    router.push("/");
                  }}
                >
                  <LogOutIcon /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="w-full min-w-0 flex-1 space-y-8 p-4 sm:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
