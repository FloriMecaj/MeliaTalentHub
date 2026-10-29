"use client";

import {
  BookmarkIcon, BriefcaseBusinessIcon, FileCheckIcon, InboxIcon, LayoutDashboardIcon, UserIcon,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { useStudent } from "@/lib/hooks";

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { db, user, profile, worker } = useStudent();
  const unread = worker ? db.messages.filter((m) => m.workerId === worker.id && !m.read).length : 0;
  const saved = profile?.savedJobIds?.length ?? 0;
  const active = user ? db.applications.filter((a) => a.studentId === user.id && !["hired", "rejected"].includes(a.stage)).length : 0;
  return (
    <DashboardShell
      role="student"
      items={[
        { group: "Home", href: "/student", label: "Overview", icon: LayoutDashboardIcon },
        { group: "Find work", href: "/student/jobs", label: "Jobs & matches", icon: BriefcaseBusinessIcon },
        { group: "Find work", href: "/student/saved", label: "Saved jobs", icon: BookmarkIcon, badge: saved },
        { group: "Find work", href: "/student/applications", label: "My applications", icon: FileCheckIcon, badge: active },
        { group: "Me", href: "/student/messages", label: "Messages", icon: InboxIcon, badge: unread },
        { group: "Me", href: "/student/profile", label: "Profile & CV", icon: UserIcon },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
