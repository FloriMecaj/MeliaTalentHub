"use client";

import { SelectField } from "@/components/select-field";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ChipPicker } from "@/components/chip-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { register } from "@/lib/auth";
import { ADMIN_CODE, LANGUAGES, SKILLS } from "@/lib/options";
import { useDb } from "@/lib/store";
import type { Role, Season, StudentProfile } from "@/lib/types";


type Draft = Omit<StudentProfile, "userId">;

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const db = useDb();
  const [role, setRole] = useState<Role>(params.get("role") === "admin" ? "admin" : "student");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [acct, setAcct] = useState({ name: "", email: "", password: "", code: "" });
  const [p, setP] = useState<Draft>({
    occupation: "student", field: "", city: "", categoryIds: [], skills: [], languages: ["Albanian"],
    experienceYears: 0, availability: "summer", workedAtMelia: false, about: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  const isStudent = role === "student";
  const steps = isStudent ? ["Account", "About you", "Interests", "CV"] : ["Account"];
  const last = step === steps.length - 1;
  const patch = (x: Partial<Draft>) => setP((prev) => ({ ...prev, ...x }));

  async function submit() {
    if (!isStudent && acct.code !== ADMIN_CODE) return toast.error("Invalid administrator access code");
    setBusy(true);
    let cv: Draft["cv"];
    if (cvFile) {
      const dataUrl =
        cvFile.size <= 1_000_000
          ? await new Promise<string>((res) => {
              const r = new FileReader();
              r.onload = () => res(String(r.result));
              r.readAsDataURL(cvFile);
            })
          : undefined;
      cv = { name: cvFile.name, size: cvFile.size, dataUrl };
    }
    const user = await register(
      { name: acct.name, email: acct.email, password: acct.password, role },
      isStudent ? { ...p, cv } : undefined,
    );
    setBusy(false);
    if (!user) return toast.error("An account with this email already exists");
    toast.success("Account created");
    router.push(isStudent ? "/student" : "/admin");
  }

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (last) void submit();
    else setStep((s) => s + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
        <p className="mt-2 text-muted-foreground">
          {isStudent ? "Answer a few questions so we can match you to the right work." : "Manage jobs, invitations and exchanges."}
        </p>
      </div>

      {step === 0 && (
        <Tabs value={role} onValueChange={(v) => { setRole(v as Role); setStep(0); }}>
          <TabsList className="w-full">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="admin">Administrator</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {isStudent && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {steps.length}: {steps[step]}</span>
          </div>
          <Progress value={((step + 1) / steps.length) * 100} />
        </div>
      )}

      <form onSubmit={next} className="space-y-4">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={acct.name} onChange={(e) => setAcct({ ...acct, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={acct.email} onChange={(e) => setAcct({ ...acct, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" minLength={6} required value={acct.password} onChange={(e) => setAcct({ ...acct, password: e.target.value })} />
            </div>
            {!isStudent && (
              <div className="space-y-2">
                <Label htmlFor="code">Administrator access code</Label>
                <Input id="code" required value={acct.code} onChange={(e) => setAcct({ ...acct, code: e.target.value })} />
                <p className="text-xs text-muted-foreground">Demo code: {ADMIN_CODE}</p>
              </div>
            )}
          </>
        )}

        {isStudent && step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occ">What do you do?</Label>
                <SelectField id="occ" value={p.occupation} onChange={(v) => patch({ occupation: v as Draft["occupation"] })} options={[{ value: "student", label: "Student" }, { value: "graduate", label: "Recent graduate" }, { value: "working", label: "Currently working" }, { value: "seeking", label: "Looking for work" }]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">Field of study / work</Label>
                <Input id="field" required placeholder="e.g. Tourism" value={p.field} onChange={(e) => patch({ field: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={p.city} onChange={(e) => patch({ city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp">Years of experience</Label>
                <Input id="exp" type="number" min={0} max={30} value={p.experienceYears} onChange={(e) => patch({ experienceYears: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avail">When can you work?</Label>
                <SelectField id="avail" value={p.availability} onChange={(v) => patch({ availability: v as Season })} options={[{ value: "summer", label: "Summer season" }, { value: "winter", label: "Winter season" }, { value: "year", label: "All year (12 months)" }]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="melia">Worked at Meliá before?</Label>
                <SelectField id="melia" value={String(p.workedAtMelia)} onChange={(v) => patch({ workedAtMelia: v === "true" })} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes, last season" }]} />
              </div>
            </div>
          </>
        )}

        {isStudent && step === 2 && (
          <>
            <div className="space-y-2">
              <Label>What do you want to work in?</Label>
              <ChipPicker
                options={db.categories.map((c) => ({ value: c.id, label: c.name }))}
                value={p.categoryIds}
                onChange={(categoryIds) => patch({ categoryIds })}
              />
            </div>
            <div className="space-y-2">
              <Label>Your skills</Label>
              <ChipPicker options={SKILLS.map((s) => ({ value: s, label: s }))} value={p.skills} onChange={(skills) => patch({ skills })} allowCustom />
            </div>
            <div className="space-y-2">
              <Label>Languages</Label>
              <ChipPicker options={LANGUAGES.map((s) => ({ value: s, label: s }))} value={p.languages} onChange={(languages) => patch({ languages })} />
            </div>
          </>
        )}

        {isStudent && step === 3 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cv">CV (optional)</Label>
              <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-muted-foreground">PDF or Word. Skip this if you don&apos;t have one yet.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">Anything else we should know? (optional)</Label>
              <Textarea id="about" rows={4} value={p.about} onChange={(e) => patch({ about: e.target.value })} />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button type="button" variant="outline" className="h-10" onClick={() => setStep((s) => s - 1)}>Back</Button>
          )}
          <Button type="submit" className="h-10 flex-1" disabled={busy}>
            {last ? (busy ? "Creating…" : "Create account") : "Continue"}
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
      </p>
    </div>
  );
}
