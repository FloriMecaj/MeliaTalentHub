"use client";

import { CheckIcon, SendIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { SelectField } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Pill } from "@/components/dashboard/parts";
import { rankPool, renderTemplate, saveTemplate, sendCampaign, useDb } from "@/lib/store";
import type { Message } from "@/lib/types";

const STEPS = ["Audience", "Counts", "Message", "Review & send"];
const VARS = ["{name}", "{category}", "{season}", "{deadline}"];
const ANY = "any";

export function Wizard({ onSent }: { onSent: () => void }) {
  const db = useDb();
  const [step, setStep] = useState(0);
  const [minRating, setMinRating] = useState("1");
  const [minYears, setMinYears] = useState("0");
  const [tag, setTag] = useState(ANY);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [skip, setSkip] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [season, setSeason] = useState(db.settings.season);
  const [channel, setChannel] = useState<Message["channel"]>("WhatsApp");
  const [body, setBody] = useState(db.templates[0]?.body ?? "");
  const [deadline, setDeadline] = useState("");
  const [tplName, setTplName] = useState("");

  const pools = useMemo(
    () =>
      Object.fromEntries(
        db.categories.map((c) => [
          c.id,
          rankPool(db.workers, c.id).filter(
            (w) => w.rating >= +minRating && w.yearsAtMelia >= +minYears && (tag === ANY || w.tags.includes(tag)),
          ),
        ]),
      ),
    [db, minRating, minYears, tag],
  );

  const need = (catId: string) => {
    const c = db.categories.find((x) => x.id === catId);
    return c?.target ?? db.jobs.filter((j) => j.status === "open" && j.categoryId === catId).reduce((s, j) => s + j.positions, 0);
  };
  const secured = (catId: string) =>
    db.workers.filter((w) => w.categoryId === catId && (w.status === "confirmed" || w.status === "invited" || w.status === "exchange")).length;

  const chosen = db.categories.flatMap((c) =>
    pools[c.id].filter((w) => !skip.has(w.id)).slice(0, counts[c.id] ?? 0).map((w) => ({ w, c })),
  );
  const poolTotal = db.categories.reduce((s, c) => s + pools[c.id].length, 0);
  const tags = [...new Set(db.workers.flatMap((w) => w.tags))].filter((t) => t !== "backfilled");
  const sample = chosen[0];
  const preview = sample ? renderTemplate(body, sample.w, sample.c.name, season, deadline) : renderTemplate(body, { name: "Elira Hoxha" }, "Housekeeping", season, deadline);

  function autoFill() {
    setCounts(Object.fromEntries(db.categories.map((c) => [c.id, Math.min(pools[c.id].length, Math.max(need(c.id) - secured(c.id), 0))])));
    toast.success("Counts filled from your category targets");
  }

  const canNext = step === 0 ? poolTotal > 0 : step === 1 ? chosen.length > 0 : step === 2 ? body.trim().length > 0 : true;

  function send() {
    sendCampaign({
      name: name.trim() || `Invitations · ${season}`, season, channel, template: body,
      deadline: deadline || undefined, workerIds: chosen.map((x) => x.w.id),
    });
    toast.success(`${chosen.length} invitations sent via ${channel}`);
    setCounts({}); setSkip(new Set()); setStep(0); setName("");
    onSent();
  }

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${i === step ? "border-primary bg-accent text-accent-foreground" : i < step ? "text-foreground" : "text-muted-foreground"}`}
            >
              <span className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${i < step ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {i < step ? <CheckIcon className="size-3" /> : i + 1}
              </span>
              {s}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Who can be invited?</CardTitle><CardDescription>Only workers who are still available. Narrow the audience by quality.</CardDescription></CardHeader>
          <div className="grid gap-4 px-6 pb-6 sm:grid-cols-3">
            <div className="space-y-2"><Label>Minimum rating</Label><SelectField value={minRating} onChange={setMinRating} options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: n === 1 ? "Any rating" : `★ ${n}+` }))} /></div>
            <div className="space-y-2"><Label>Minimum years at Meliá</Label><SelectField value={minYears} onChange={setMinYears} options={[0, 1, 2, 3, 4].map((n) => ({ value: String(n), label: n === 0 ? "Any" : `${n}+ years` }))} /></div>
            <div className="space-y-2"><Label>Tag</Label><SelectField value={tag} onChange={setTag} options={[{ value: ANY, label: "Any tag" }, ...tags.map((t) => ({ value: t, label: t }))]} /></div>
            <p className="text-sm sm:col-span-3"><b>{poolTotal}</b> of {db.workers.length} workers match.</p>
          </div>
        </Card>
      )}

      {step === 1 && (
        <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><CardTitle>How many do you need?</CardTitle><CardDescription>Selected <b className="text-foreground">{chosen.length}</b> of {poolTotal} available.</CardDescription></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={autoFill}>Auto-fill from targets</Button>
                  <Button size="sm" variant="outline" onClick={() => setCounts(Object.fromEntries(db.categories.map((c) => [c.id, pools[c.id].length])))}>Everyone</Button>
                  <Button size="sm" variant="ghost" onClick={() => setCounts({})}>Reset</Button>
                </div>
              </div>
            </CardHeader>
            <div className="space-y-4 px-6 pb-6">
              {db.categories.map((c) => {
                const pool = pools[c.id];
                const n = Math.min(counts[c.id] ?? 0, pool.length);
                const target = need(c.id);
                const sec = secured(c.id);
                return (
                  <div key={c.id} className="rounded-xl border p-4">
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{pool.length} available · {sec} secured · target {target}</p>
                        <input aria-label={`${c.name} count`} type="range" min={0} max={pool.length} value={n} disabled={!pool.length}
                          onChange={(e) => setCounts({ ...counts, [c.id]: +e.target.value })} className="mt-2 w-full accent-sky-500" />
                      </div>
                      <Input aria-label={`${c.name} number to invite`} type="number" min={0} max={pool.length} value={n} disabled={!pool.length}
                        onChange={(e) => setCounts({ ...counts, [c.id]: Math.max(0, Math.min(pool.length, +e.target.value || 0)) })} className="w-20 text-center" />
                    </div>
                    {target > 0 && (
                      <div className="mt-2 space-y-1">
                        <Progress value={Math.min(100, ((sec + n) / target) * 100)} />
                        <p className="text-xs text-muted-foreground">{sec + n} of {target} after this campaign</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="self-start">
            <CardHeader><CardTitle>Who will be invited</CardTitle><CardDescription>Best-rated first. Skip someone and the next-best is pulled in.</CardDescription></CardHeader>
            <div className="max-h-[32rem] space-y-1 overflow-y-auto px-6 pb-6">
              {chosen.length === 0 && <p className="text-sm text-muted-foreground">Set a count to see the list.</p>}
              {chosen.map(({ w, c }) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                  <span><b>{w.name}</b> <span className="text-xs text-muted-foreground">{c.name} · ★{w.rating} · {w.yearsAtMelia}y</span></span>
                  <Button size="icon-xs" variant="ghost" aria-label={`Skip ${w.name}`} onClick={() => setSkip(new Set(skip).add(w.id))}><XIcon /></Button>
                </div>
              ))}
              {skip.size > 0 && <Button size="sm" variant="outline" className="mt-2" onClick={() => setSkip(new Set())}>Restore {skip.size} skipped</Button>}
            </div>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Write the message</CardTitle></CardHeader>
            <div className="space-y-4 px-6 pb-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="cn">Campaign name</Label><Input id="cn" placeholder={`Invitations · ${season}`} value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="ss">Season</Label><Input id="ss" value={season} onChange={(e) => setSeason(e.target.value)} /></div>
                <div className="space-y-2"><Label>Channel</Label><SelectField value={channel} onChange={(v) => setChannel(v as Message["channel"])} options={[{ value: "WhatsApp", label: "WhatsApp" }, { value: "App", label: "In-app only" }]} /></div>
                <div className="space-y-2"><Label>Reply deadline</Label><DatePicker value={deadline} onChange={setDeadline} placeholder="No deadline" /></div>
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <SelectField placeholder="Load a saved template…" value="" onChange={(id) => setBody(db.templates.find((t) => t.id === id)?.body ?? body)} options={db.templates.map((t) => ({ value: t.id, label: t.name }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea id="body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
                <div className="flex flex-wrap items-center gap-2">
                  {VARS.map((v) => <Button key={v} type="button" size="xs" variant="outline" onClick={() => setBody((b) => `${b} ${v}`)}>{v}</Button>)}
                  <span className="ml-auto text-xs text-muted-foreground">{body.length} characters</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Save as template…" value={tplName} onChange={(e) => setTplName(e.target.value)} />
                <Button variant="outline" disabled={!tplName.trim()} onClick={() => { saveTemplate({ name: tplName.trim(), body }); setTplName(""); toast.success("Template saved"); }}>Save</Button>
              </div>
            </div>
          </Card>
          <Card className="self-start bg-muted/40">
            <CardHeader><CardTitle>Preview</CardTitle><CardDescription>{sample ? `As ${sample.w.name} will see it` : "Sample"}</CardDescription></CardHeader>
            <div className="px-6 pb-6">
              <div className="mx-auto max-w-sm rounded-2xl bg-[#e7ddd3] p-4 dark:bg-slate-800">
                <p className="mb-2 text-center text-[10px] font-semibold text-muted-foreground">{channel.toUpperCase()}</p>
                <div className="ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-[#d9fdd3] p-3 text-sm text-slate-900 shadow-sm">
                  {preview}
                  <span className="mt-1 block text-right text-[10px] text-slate-500">now ✓✓</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Review & send</CardTitle><CardDescription>This sends {chosen.length} {channel} invitations right now.</CardDescription></CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              {db.categories.map((c) => {
                const n = chosen.filter((x) => x.c.id === c.id).length;
                return n ? <Pill key={c.id} tone="sky">{c.name}: {n}</Pill> : null;
              })}
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div><dt className="text-muted-foreground">Campaign</dt><dd>{name || `Invitations · ${season}`}</dd></div>
              <div><dt className="text-muted-foreground">Season</dt><dd>{season}</dd></div>
              <div><dt className="text-muted-foreground">Reply by</dt><dd>{deadline || "No deadline"}</dd></div>
            </dl>
            <div className="rounded-xl bg-emerald-500/10 p-4 text-sm"><p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">PREVIEW</p>{preview}</div>
            <Button size="lg" className="h-11" onClick={send}><SendIcon /> Send {chosen.length} invitations</Button>
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        {step < 3 && <Button disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</Button>}
      </div>
    </div>
  );
}
