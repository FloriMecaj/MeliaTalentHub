import type { Job, StudentProfile } from "./types";

export type MatchResult = {
  score: number;
  label: "Compatible" | "Partial" | "Low";
  reasons: string[];
  gaps: string[];
};

const lower = (xs: string[]) => xs.map((x) => x.trim().toLowerCase());

/**
 * Rule-based compatibility between a student profile and a job.
 * Weights: category 35, skills 30, languages 15, experience 10, season 10.
 */
export function matchJob(profile: StudentProfile | undefined, job: Job): MatchResult {
  if (!profile) return { score: 0, label: "Low", reasons: [], gaps: ["Complete your profile"] };

  const reasons: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (profile.categoryIds.includes(job.categoryId)) {
    score += 35;
    reasons.push("Matches the field you want to work in");
  } else gaps.push("Not in your preferred work categories");

  const have = new Set(lower(profile.skills));
  const need = lower(job.requiredSkills);
  if (need.length === 0) score += 30;
  else {
    const hit = need.filter((s) => have.has(s));
    score += Math.round((hit.length / need.length) * 30);
    if (hit.length) reasons.push(`${hit.length}/${need.length} required skills`);
    const miss = job.requiredSkills.filter((s) => !have.has(s.toLowerCase()));
    if (miss.length) gaps.push(`Missing skills: ${miss.join(", ")}`);
  }

  const langs = new Set(lower(profile.languages));
  const needLang = lower(job.languages);
  if (needLang.length === 0) score += 15;
  else {
    const hit = needLang.filter((l) => langs.has(l));
    score += Math.round((hit.length / needLang.length) * 15);
    if (hit.length === needLang.length) reasons.push("Speaks all required languages");
    else gaps.push(`Missing languages: ${job.languages.filter((l) => !langs.has(l.toLowerCase())).join(", ")}`);
  }

  if (profile.experienceYears >= job.minExperience) {
    score += 10;
    reasons.push(job.minExperience ? "Meets experience requirement" : "No experience needed");
  } else gaps.push(`Needs ${job.minExperience}+ years of experience`);

  if (profile.availability === "year" || profile.availability === job.season || job.season === "year") {
    score += 10;
    reasons.push("Available in the right season");
  } else gaps.push("Season availability differs");

  if (profile.workedAtMelia) {
    score = Math.min(100, score + 5);
    reasons.push("Returning Meliá team member");
  }

  return {
    score,
    label: score >= 70 ? "Compatible" : score >= 40 ? "Partial" : "Low",
    reasons,
    gaps,
  };
}
