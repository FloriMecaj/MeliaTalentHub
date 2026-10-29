import Link from "next/link";
import {
  ArrowRightIcon, BriefcaseBusinessIcon, CheckCircle2Icon, MessageCircleIcon, PlaneIcon,
  SparklesIcon, UserPlusIcon, UsersIcon,
} from "lucide-react";
import { AudienceTabs } from "@/components/site/audience-tabs";
import { BoardMock, DashboardMock, ExchangeMock, InviteMock, MatchMock } from "@/components/site/mockups";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { v: "-70%", l: "Time-to-fill", d: "Automated matching replaces weeks of admin." },
  { v: "-40%", l: "Onboarding cost", d: "Returning staff are already trained." },
  { v: "€0", l: "Agency fees", d: "Vocational pipelines replace headhunters." },
  { v: "12 mo", l: "Retention", d: "Closes the seasonal turnover leak." },
];

const journeyStudent = [
  { icon: UserPlusIcon, t: "Register in 2 minutes", d: "Tell us what you do and what you want to work in. CV optional." },
  { icon: SparklesIcon, t: "See your matches", d: "Your dashboard ranks every open job by compatibility." },
  { icon: BriefcaseBusinessIcon, t: "Apply and track", d: "Apply in one click and follow each stage to the interview." },
  { icon: MessageCircleIcon, t: "Get invited back", d: "Come back next season with an invitation, not a new application." },
  { icon: PlaneIcon, t: "Work through winter", d: "Placed at a partner hotel, then back at Meliá in summer." },
];
const journeyAdmin = [
  { icon: UserPlusIcon, t: "Set up categories", d: "Define work categories and headcount targets." },
  { icon: BriefcaseBusinessIcon, t: "Post jobs", d: "Students see their compatibility the moment you publish." },
  { icon: UsersIcon, t: "Review the board", d: "Rank, compare and move applicants through your pipeline." },
  { icon: MessageCircleIcon, t: "Invite your best", d: "Pick counts per category and send the campaign." },
  { icon: PlaneIcon, t: "Place for winter", d: "Assign workers to partners and bring them back." },
];

const tour = [
  { tag: "Students", title: "A compatibility score for every job", body: "No more guessing. Each announcement is scored against your profile, with the reasons you fit, the gaps, and the exact skill that would raise your score.", points: ["Weighs category, skills, languages, experience and season", "Suggests what to add to reach Compatible", "Returning Meliá staff get a bonus"], mock: <MatchMock /> },
  { tag: "Administrators", title: "An applicant board that runs your hiring", body: "See every candidate by stage, ranked by match. Open any card for the full profile, CV, notes and interview scheduling.", points: ["Drag and drop between stages", "Filters, bulk actions, side-by-side compare, CSV export", "'Top picks' shortlists the best 3 per job"], mock: <BoardMock /> },
  { tag: "Administrators", title: "Invite 100 of your 200 best, in a few clicks", body: "Choose how many you need per category. The highest-rated returning workers are invited first, by WhatsApp or in-app, and you can follow up or backfill declines.", points: ["Auto-fill counts from your category targets", "Preview the exact message each worker sees", "Campaign funnel: sent, confirmed, waiting, declined"], mock: <InviteMock /> },
  { tag: "Everyone", title: "Winter exchange programs keep careers moving", body: "Workers you don't need in winter are placed at partner companies and return next season. Admins see the whole picture; workers see their salary, housing and dates.", points: ["Pipeline, timeline and partner capacity", "Matching suggests who to send where", "Return reminders so no one is forgotten"], mock: <ExchangeMock /> },
];

const faqs = [
  { q: "Do I need a CV to register?", a: "No. A CV is optional. Answer a few questions about what you do, what you want to work in, your skills and languages, and the platform can already match you. You can add a CV any time from your profile." },
  { q: "How is my compatibility score calculated?", a: "It is a transparent, rule-based score out of 100: 35 for matching the work category you want, 30 for required skills, 15 for languages, 10 for experience and 10 for season availability. Returning Meliá staff get a small bonus. Every score lists the reasons and the gaps." },
  { q: "How do administrators decide who gets invited back?", a: "Administrators choose a count per category, for example 100 of 200 past workers. The platform invites the highest-rated people first, then the longest-serving. Admins can filter the audience, skip individuals and preview every message." },
  { q: "What is an exchange program?", a: "When Meliá doesn't need a worker over winter, the administrator places them at a partner company with agreed dates, salary, and optional housing and transport. The worker sees it in their dashboard and returns next season." },
  { q: "Is this a real service or a demo?", a: "This is a working demo built for Innovation Bootcamp Albania. Everything is stored in your own browser, WhatsApp sending is simulated, and passwords are only suitable for demo use. Use the demo accounts below to explore." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[640px] rounded-full bg-sky-400/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-40 -left-20 h-[360px] w-[480px] rounded-full bg-amber-400/15 blur-[120px]" />
        <div className="relative grid w-full items-center gap-14 px-6 py-20 lg:px-12 lg:py-28 xl:grid-cols-[1fr_1.1fr]">
          <div>
            <Badge variant="outline" className="mb-6 border-amber-500/40 text-gold">INNOVATION BOOTCAMP ALBANIA · ENTERPRISE B2B</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl xl:text-6xl">
              Seasonal jobs become{" "}
              <span className="bg-gradient-to-r from-sky-500 to-amber-500 bg-clip-text text-transparent">12-month careers.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
              One platform for students who want a future in hospitality and the Meliá team that hires them. Register in two minutes, get matched to the right role, and be invited back every season.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-7" nativeButton={false} render={<Link href="/register" />}>I&apos;m a student <ArrowRightIcon /></Button>
              <Button size="lg" variant="outline" className="h-12 px-7" nativeButton={false} render={<Link href="/register?role=admin" />}>I&apos;m an administrator</Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Free to join", "No CV required", "Light and dark mode"].map((x) => <li key={x} className="flex items-center gap-1.5"><CheckCircle2Icon className="size-4 text-emerald-500" />{x}</li>)}
            </ul>
          </div>
          <DashboardMock />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="grid w-full grid-cols-2 gap-6 px-6 py-10 lg:grid-cols-4 lg:px-12">
          {stats.map((s) => (
            <div key={s.l}><p className="text-4xl font-extrabold tracking-tight text-primary">{s.v}</p><p className="font-medium">{s.l}</p><p className="text-sm text-muted-foreground">{s.d}</p></div>
          ))}
        </div>
      </section>

      {/* Audience tabs */}
      <section id="dashboards" className="w-full px-6 py-24 lg:px-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">What you get</p>
        <h2 className="mt-3 mb-10 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">Two dashboards. One closed loop.</h2>
        <AudienceTabs />
      </section>

      {/* Journey */}
      <section className="w-full bg-muted/50 px-6 py-24 lg:px-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">After you register</p>
        <h2 className="mt-3 mb-12 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">What happens next</h2>
        <div className="grid gap-10 xl:grid-cols-2">
          {[["As a student", journeyStudent], ["As an administrator", journeyAdmin]].map(([title, steps]) => (
            <div key={title as string}>
              <h3 className="mb-5 text-lg font-bold">{title as string}</h3>
              <ol className="relative space-y-6 border-l pl-8">
                {(steps as typeof journeyStudent).map((s, i) => (
                  <li key={s.t} className="relative">
                    <span className="absolute -left-[3.05rem] flex size-9 items-center justify-center rounded-full border bg-background text-primary"><s.icon className="size-4" /></span>
                    <p className="font-semibold"><span className="mr-2 text-muted-foreground">{i + 1}.</span>{s.t}</p>
                    <p className="text-sm text-muted-foreground">{s.d}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Tour */}
      <section className="w-full px-6 py-24 lg:px-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Product tour</p>
        <h2 className="mt-3 mb-16 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">See what you&apos;ll be using</h2>
        <div className="space-y-24">
          {tour.map((t, i) => (
            <div key={t.title} className="grid items-center gap-12 xl:grid-cols-2">
              <div className={i % 2 ? "xl:order-2" : ""}>
                <Badge variant="secondary" className="mb-4">{t.tag}</Badge>
                <h3 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{t.title}</h3>
                <p className="mt-3 max-w-xl text-muted-foreground">{t.body}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {t.points.map((p) => <li key={p} className="flex gap-2"><CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-500" />{p}</li>)}
                </ul>
              </div>
              <div className={i % 2 ? "xl:order-1" : ""}>{t.mock}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact link */}
      <section className="w-full px-6 lg:px-12">
        <Card className="bg-gradient-to-br from-amber-500/10 to-sky-500/10">
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Good for margins, good for people</CardTitle>
              <CardDescription className="mt-1 max-w-2xl">Built around ESG (social pillar) and UN SDG 8, decent work: stable, structured careers instead of dead-end seasonal gigs, with the savings to prove it.</CardDescription>
            </div>
            <Button variant="outline" nativeButton={false} render={<Link href="/impact" />}>See the impact & ROI <ArrowRightIcon /></Button>
          </CardHeader>
        </Card>
      </section>

      {/* FAQ */}
      <section className="w-full px-6 py-24 lg:px-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">FAQ</p>
        <h2 className="mt-3 mb-8 text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2>
        <Accordion className="max-w-4xl">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="w-full px-6 lg:px-12">
        <div className="rounded-3xl bg-gradient-to-br from-sky-500 to-sky-700 px-8 py-16 text-center text-white sm:px-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">Meliá Hotel: Excellence Knows No Season.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sky-50/90">Create your account and see your dashboard in two minutes. Or try the demo logins: <b>student@melia.al</b> / student123 and <b>admin@melia.al</b> / admin123.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" className="h-12 px-7" nativeButton={false} render={<Link href="/register" />}>Register as a student</Button>
            <Button size="lg" variant="outline" className="h-12 border-white/40 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white" nativeButton={false} render={<Link href="/login" />}>Log in to try the demo</Button>
          </div>
        </div>
      </section>
    </>
  );
}
