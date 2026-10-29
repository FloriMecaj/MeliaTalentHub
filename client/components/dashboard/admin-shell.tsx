"use client";

import {
  BarChart3Icon, BriefcaseBusinessIcon, FileCheckIcon, LayoutDashboardIcon, MailIcon,
  MessageSquareIcon, PlaneIcon, SettingsIcon, TagsIcon, UsersIcon,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useDb } from "@/lib/store";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const db = useDb();
  const fresh = db.applications.filter((a) => a.stage === "new").length;
  const waiting = db.workers.filter((w) => w.status === "invited").length;
  return (
    <DashboardShell
      role="admin"
      items={[
        { group: "Overview", href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
        { group: "Recruit", href: "/admin/jobs", label: "Jobs", icon: BriefcaseBusinessIcon },
        { group: "Recruit", href: "/admin/applicants", label: "Applicants", icon: FileCheckIcon, badge: fresh },
        { group: "Recruit", href: "/admin/categories", label: "Categories", icon: TagsIcon },
        { group: "Workforce", href: "/admin/workers", label: "Past workers", icon: UsersIcon },
        { group: "Workforce", href: "/admin/invitations", label: "Invitations", icon: MessageSquareIcon, badge: waiting },
        { group: "Workforce", href: "/admin/exchange", label: "Exchange programs", icon: PlaneIcon },
        { group: "Insights", href: "/admin/messages", label: "Messages", icon: MailIcon },
        { group: "Insights", href: "/admin/reports", label: "Reports", icon: BarChart3Icon },
        { group: "System", href: "/admin/settings", label: "Settings", icon: SettingsIcon },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
