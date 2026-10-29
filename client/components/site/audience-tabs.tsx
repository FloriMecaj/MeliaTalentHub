"use client";

import Link from "next/link";
import {
  ArrowRightIcon, BarChart3Icon, BellRingIcon, BookmarkIcon, CalendarCheckIcon, CheckCircle2Icon,
  FileCheckIcon, KanbanIcon, MessageCircleIcon, PlaneIcon, SendIcon, SparklesIcon, UserRoundCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsMock, MatchMock, PhoneNotice } from "./mockups";

const student = [
  { icon: SparklesIcon, t: "Know before you apply", d: "Every job shows an AI compatibility score with the reasons you fit and the gaps that hold you back." },
  { icon: BookmarkIcon, t: "Boost your matches", d: "See which skill or language would lift your score most, and add it to your profile in one tap." },
  { icon: FileCheckIcon, t: "Track every application", d: "Follow each application through screening, interview and offer, with interview dates in one place." },
  { icon: MessageCircleIcon, t: "Get invited back", d: "Returning staff get a WhatsApp or in-app invitation and accept or decline in one tap." },
  { icon: PlaneIcon, t: "Winter exchange", d: "Placed at a partner hotel for the off-season? See the salary, housing and dates, and return next summer." },
  { icon: UserRoundCheckIcon, t: "Simple, optional profile", d: "Answer a few questions. A CV is optional. A profile-strength meter shows what to add next." },
];
const admin = [
  { icon: KanbanIcon, t: "Applicant board", d: "Drag candidates through your pipeline. Filter, compare two side by side, bulk-move and export." },
  { icon: SendIcon, t: "Invitation automation", d: "Have 200 past workers but need 100? Set the count per category and the best-rated are invited first." },
  { icon: BellRingIcon, t: "Follow-up and backfill", d: "Remind people who haven't replied, and automatically invite replacements for every decline." },
  { icon: PlaneIcon, t: "Exchange programs", d: "Place workers at partner companies for winter with a pipeline, timeline, capacity and matching." },
  { icon: BarChart3Icon, t: "Analytics and reports", d: "Funnels, targets per category, savings versus agencies, CSV export and one-click backups." },
  { icon: CalendarCheckIcon, t: "Run it from one place", d: "Jobs, categories, workers, messages and a ⌘K search to jump anywhere." },
];

function List({ items }: { items: typeof student }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {items.map((f) => (
        <li key={f.t} className="flex gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><f.icon className="size-4" /></span>
          <div><p className="font-semibold">{f.t}</p><p className="text-sm text-muted-foreground">{f.d}</p></div>
        </li>
      ))}
    </ul>
  );
}

export function AudienceTabs() {
  return (
    <Tabs defaultValue="student">
      <TabsList className="h-11">
        <TabsTrigger value="student" className="px-5">For students</TabsTrigger>
        <TabsTrigger value="admin" className="px-5">For administrators</TabsTrigger>
      </TabsList>

      <TabsContent value="student" className="mt-10 grid items-center gap-12 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Your career, not just a summer job</h3>
            <p className="mt-2 max-w-2xl text-muted-foreground">Register once and the platform works for you all year: it finds the roles you fit, tells you where to improve and brings you back every season.</p>
          </div>
          <List items={student} />
          <Button size="lg" className="h-11 px-6" nativeButton={false} render={<Link href="/register" />}>Create a student account <ArrowRightIcon /></Button>
        </div>
        <div className="space-y-5"><MatchMock /><PhoneNotice /></div>
      </TabsContent>

      <TabsContent value="admin" className="mt-10 grid items-center gap-12 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">A management console for your whole workforce</h3>
            <p className="mt-2 max-w-2xl text-muted-foreground">Replace spreadsheets, agency calls and panicked spring hiring with one system that handles recruiting, retention and winter mobility.</p>
          </div>
          <List items={admin} />
          <Button size="lg" className="h-11 px-6" nativeButton={false} render={<Link href="/register?role=admin" />}>Create an administrator account <ArrowRightIcon /></Button>
        </div>
        <AnalyticsMock />
      </TabsContent>
    </Tabs>
  );
}

export { CheckCircle2Icon };
