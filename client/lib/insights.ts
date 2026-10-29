import { matchJob } from "./match";
import { LANGUAGES, SKILLS } from "./options";
import type { Job, StudentProfile } from "./types";

export type Booster = {
  kind: "skill" | "language";
  name: string;
  /** summed match-score gain across open jobs */
  gain: number;
  /** jobs that would become Compatible (70+) */
  unlocks: number;
};

/** Which skills/languages would raise the student's match the most. */
export function boosters(profile: StudentProfile | undefined, jobs: Job[]): Booster[] {
  if (!profile) return [];
  const open = jobs.filter((j) => j.status === "open");
  const base = open.map((j) => matchJob(profile, j).score);
  const have = new Set([...profile.skills, ...profile.languages].map((x) => x.toLowerCase()));
  const pool: { kind: Booster["kind"]; name: string }[] = [
    ...[...new Set([...SKILLS, ...open.flatMap((j) => j.requiredSkills)])].map((name) => ({ kind: "skill" as const, name })),
    ...[...new Set([...LANGUAGES, ...open.flatMap((j) => j.languages)])].map((name) => ({ kind: "language" as const, name })),
  ].filter((c) => !have.has(c.name.toLowerCase()));

  return pool
    .map((c) => {
      const next: StudentProfile =
        c.kind === "skill" ? { ...profile, skills: [...profile.skills, c.name] } : { ...profile, languages: [...profile.languages, c.name] };
      let gain = 0, unlocks = 0;
      open.forEach((j, i) => {
        const s = matchJob(next, j).score;
        gain += s - base[i];
        if (base[i] < 70 && s >= 70) unlocks++;
      });
      return { ...c, gain, unlocks };
    })
    .filter((b) => b.gain > 0)
    .sort((a, b) => b.unlocks - a.unlocks || b.gain - a.gain)
    .slice(0, 4);
}

export function profileChecklist(p: StudentProfile | undefined) {
  return [
    { label: "Field and city", done: !!p?.field && !!p?.city },
    { label: "Pick the work categories you want", done: (p?.categoryIds.length ?? 0) > 0 },
    { label: "Add at least 3 skills", done: (p?.skills.length ?? 0) >= 3 },
    { label: "Add your languages", done: (p?.languages.length ?? 0) > 0 },
    { label: "Write a short about-you", done: !!p?.about },
    { label: "Upload your CV", done: !!p?.cv },
  ];
}
