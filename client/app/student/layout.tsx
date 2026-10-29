import { StudentShell } from "@/components/dashboard/student-shell";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
