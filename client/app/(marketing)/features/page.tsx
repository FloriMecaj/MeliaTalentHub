import {
  BarChart3Icon, FileTextIcon, LayoutGridIcon, MessageCircleIcon,
  PlaneIcon, SparklesIcon, UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const student = [
  { icon: FileTextIcon, t: "Simple onboarding", d: "A short questionnaire on what you do and what you want to work in. CV upload is optional." },
  { icon: SparklesIcon, t: "AI compatibility score", d: "See how well you fit each announced job, why, and what you're missing, before applying." },
  { icon: MessageCircleIcon, t: "Invitations inbox", d: "Returning staff receive an invitation and accept or decline in one tap." },
  { icon: PlaneIcon, t: "Winter exchange", d: "See the partner company you've been placed at and when you return." },
];
const admin = [
  { icon: BarChart3Icon, t: "Analytics overview", d: "Applications, invitation funnel, headcount per category and exchange status at a glance." },
  { icon: LayoutGridIcon, t: "Categories & jobs", d: "Define work categories in their own panel and announce jobs with required skills and languages." },
  { icon: MessageCircleIcon, t: "Invitation automation", d: "Have 200 workers but need 100? Set the count per category. The top-rated are invited automatically." },
  { icon: PlaneIcon, t: "Exchange programs", d: "Assign a worker you don't need this winter to a partner company, and bring them back next season." },
  { icon: UsersIcon, t: "Applicant review", d: "Applicants ranked by AI match score. Accept or reject in one click." },
];

function Grid({ items }: { items: typeof student }) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((f) => (
        <Card key={f.t}>
          <CardHeader>
            <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <f.icon className="size-5" />
            </span>
            <CardTitle>{f.t}</CardTitle>
            <CardDescription>{f.d}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <section className="w-full px-6 py-16 lg:px-12">
      <Badge variant="outline" className="mb-4">Features</Badge>
      <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
        One platform, two dashboards
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Students get a career path. Administrators get a predictable, low-cost workforce.
      </p>
      <Tabs defaultValue="student" className="mt-10">
        <TabsList>
          <TabsTrigger value="student">For students</TabsTrigger>
          <TabsTrigger value="admin">For administrators</TabsTrigger>
        </TabsList>
        <TabsContent value="student"><Grid items={student} /></TabsContent>
        <TabsContent value="admin"><Grid items={admin} /></TabsContent>
      </Tabs>
    </section>
  );
}
