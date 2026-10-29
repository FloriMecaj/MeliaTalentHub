"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const stats = [
  { v: "-70%", l: "Time-to-Fill", d: "Automated matching replaces weeks of administrative lag." },
  { v: "-40%", l: "Onboarding Cost", d: "Eliminates retraining overhead via pre-trained, returning talent." },
  { v: "€0", l: "Agency Fees", d: "Replaces expensive external headhunters with integrated vocational pipelines." },
  { v: "12-Mo", l: "Retention", d: "Permanently closes the seasonal turnover leak." },
];

const pillars = [
  { tag: "ESG · Social", t: "Workforce stability", d: "Mitigates human capital volatility, eliminates predatory seasonal layoffs, and guarantees workforce stability and wellbeing." },
  { tag: "SDG 8 · Decent Work", t: "Careers, not gigs", d: "Transforms dead-end seasonal gigs into structured, long-term professional hospitality careers while reversing regional brain drain." },
];

const pricing = [
  { t: "Core Enterprise SaaS License", d: "Annual platform maintenance fee paid by Meliá to manage the automated talent database and mobility protocol." },
  { t: "Success-Based Placement Tier", d: "Micro-fee per automated seasonal placement, retaining a 50% cost advantage over traditional headhunters." },
  { t: "Regional Scalability", d: "A modular B2B engine ready to expand across Adriatic and Mediterranean resort networks." },
];

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function Calculator() {
  const [hires, setHires] = useState(150);
  const [fee, setFee] = useState(400);
  const agency = hires * fee;
  const engine = hires * fee * 0.5;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings calculator</CardTitle>
        <CardDescription>Estimate what you stop paying external headhunters.</CardDescription>
      </CardHeader>
      <div className="grid gap-6 px-6 pb-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hires">Seasonal hires per year: <b>{hires}</b></Label>
            <input id="hires" type="range" min={20} max={500} value={hires} onChange={(e) => setHires(+e.target.value)} className="w-full accent-sky-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Agency fee per hire: <b>{eur.format(fee)}</b></Label>
            <input id="fee" type="range" min={100} max={1000} step={50} value={fee} onChange={(e) => setFee(+e.target.value)} className="w-full accent-sky-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Agency cost today</p><p className="text-2xl font-bold">{eur.format(agency)}</p></div>
          <div className="rounded-xl bg-accent p-4"><p className="text-xs text-accent-foreground">Talent Hub cost (50%)</p><p className="text-2xl font-bold text-accent-foreground">{eur.format(engine)}</p></div>
          <div className="col-span-2 rounded-xl bg-emerald-500/10 p-4"><p className="text-xs text-muted-foreground">Estimated yearly saving</p><p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{eur.format(agency - engine)}</p></div>
        </div>
      </div>
    </Card>
  );
}

export default function ImpactPage() {
  return (
    <div className="w-full space-y-20 px-6 py-16 lg:px-12">
      <section>
        <Badge variant="outline" className="mb-4">Impact & ROI</Badge>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          Enterprise-grade efficiency & margin protection
        </h1>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.l}>
              <CardHeader>
                <p className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">{s.v}</p>
                <CardTitle className="mt-1">{s.l}</CardTitle>
                <CardDescription>{s.d}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Calculator />

      <section>
        <h2 className="text-3xl font-bold tracking-tight">Sustainable growth & social governance</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {pillars.map((p) => (
            <Card key={p.tag}>
              <CardHeader>
                <Badge className="mb-2 w-fit bg-accent text-accent-foreground">{p.tag}</Badge>
                <CardTitle className="text-xl">{p.t}</CardTitle>
                <CardDescription>{p.d}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold tracking-tight">Scalable monetization</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pricing.map((p) => (
            <Card key={p.t}>
              <CardHeader>
                <CardTitle className="text-gold">{p.t}</CardTitle>
                <CardDescription>{p.d}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
