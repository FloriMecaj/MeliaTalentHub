"use client";

import { SelectField } from "@/components/select-field";
import { useState } from "react";
import { FileIcon } from "lucide-react";
import { toast } from "sonner";
import { ChipPicker } from "@/components/chip-picker";
import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pill } from "@/components/dashboard/parts";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2Icon } from "lucide-react";
import { profileChecklist } from "@/lib/insights";
import { profileCompleteness, useStudent } from "@/lib/hooks";
import { saveProfile } from "@/lib/store";
import type { Season, StudentProfile } from "@/lib/types";
import { LANGUAGES, SKILLS } from "@/lib/options";

export default function StudentProfilePage() {
  const { user, profile } = useStudent();
  if (!user) return null;
  return <ProfileForm key={user.id} userId={user.id} initial={profile} />;
}

function ProfileForm({ userId, initial }: { userId: string; initial?: StudentProfile }) {
  const { db } = useStudent();
  const [p, setP] = useState<StudentProfile>(
    initial ?? {
      userId, occupation: "student", field: "", city: "", categoryIds: [], skills: [],
      languages: [], experienceYears: 0, availability: "summer", workedAtMelia: false, about: "",
    },
  );
  const patch = (x: Partial<StudentProfile>) => setP((prev) => ({ ...prev, ...x }));
  const dirty = JSON.stringify(p) !== JSON.stringify(initial ?? p);

  async function onCv(file: File | null) {
    if (!file) return;
    const dataUrl =
      file.size <= 1_000_000
        ? await new Promise<string>((res) => {
            const r = new FileReader();
            r.onload = () => res(String(r.result));
            r.readAsDataURL(file);
          })
        : undefined;
    patch({ cv: { name: file.name, size: file.size, dataUrl } });
  }

  return (
    <>
      <PageHeader title="Profile & CV" description="This is what the AI uses to score your compatibility." />
      <Card className="p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Profile strength</p>
            <p className="text-4xl font-extrabold">{profileCompleteness(p)}%</p>
            <Progress value={profileCompleteness(p)} />
            {dirty && <Pill tone="amber">Unsaved changes</Pill>}
          </div>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {profileChecklist(p).map((c) => (
              <li key={c.label} className={`flex items-center gap-2 ${c.done ? "text-muted-foreground" : ""}`}>
                <CheckCircle2Icon className={`size-4 ${c.done ? "text-emerald-500" : "text-muted-foreground/40"}`} />{c.label}
              </li>
            ))}
          </ul>
        </div>
      </Card>
      <form
        className="grid gap-6 xl:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); saveProfile(p); toast.success("Profile saved"); }}
      >
        <Card className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occ">What do you do?</Label>
              <SelectField id="occ" value={p.occupation} onChange={(v) => patch({ occupation: v as StudentProfile["occupation"] })} options={[{ value: "student", label: "Student" }, { value: "graduate", label: "Recent graduate" }, { value: "working", label: "Currently working" }, { value: "seeking", label: "Looking for work" }]} />
            </div>
            <div className="space-y-2"><Label htmlFor="field">Field</Label><Input id="field" value={p.field} onChange={(e) => patch({ field: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={p.city} onChange={(e) => patch({ city: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="exp">Years of experience</Label><Input id="exp" type="number" min={0} value={p.experienceYears} onChange={(e) => patch({ experienceYears: +e.target.value })} /></div>
            <div className="space-y-2">
              <Label htmlFor="av">Availability</Label>
              <SelectField id="av" value={p.availability} onChange={(v) => patch({ availability: v as Season })} options={[{ value: "summer", label: "Summer" }, { value: "winter", label: "Winter" }, { value: "year", label: "All year" }]} />
            </div>
          </div>
          <div className="space-y-2"><Label htmlFor="about">About you</Label><Textarea id="about" rows={4} value={p.about} onChange={(e) => patch({ about: e.target.value })} /></div>
          <div className="space-y-2">
            <Label htmlFor="cv">CV (optional)</Label>
            {p.cv && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><FileIcon className="size-4" />{p.cv.name} · {(p.cv.size / 1024).toFixed(0)} KB</p>
            )}
            <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => onCv(e.target.files?.[0] ?? null)} />
          </div>
        </Card>

        <Card className="space-y-6 p-6">
          <div className="space-y-2">
            <Label>Work categories you want</Label>
            <ChipPicker options={db.categories.map((c) => ({ value: c.id, label: c.name }))} value={p.categoryIds} onChange={(categoryIds) => patch({ categoryIds })} />
          </div>
          <div className="space-y-2">
            <Label>Skills</Label>
            <ChipPicker options={SKILLS.map((s) => ({ value: s, label: s }))} value={p.skills} onChange={(skills) => patch({ skills })} allowCustom />
          </div>
          <div className="space-y-2">
            <Label>Languages</Label>
            <ChipPicker options={LANGUAGES.map((s) => ({ value: s, label: s }))} value={p.languages} onChange={(languages) => patch({ languages })} />
          </div>
          <Button type="submit" className="h-10">Save profile</Button>
        </Card>
      </form>
    </>
  );
}
