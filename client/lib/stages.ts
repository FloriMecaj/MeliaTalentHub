import { matchJob } from "./match";
import type { Application, Category, DB, Job, Stage, StudentProfile, User } from "./types";

export const STAGE_META: Record<Stage, { label: string; tone: "gray" | "sky" | "violet" | "amber" | "green" | "red" }> = {
  new: { label: "New", tone: "gray" },
  screening: { label: "Screening", tone: "sky" },
  interview: { label: "Interview", tone: "violet" },
  offer: { label: "Offer", tone: "amber" },
  hired: { label: "Hired", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};

export type ApplicantRow = {
  app: Application;
  user?: User;
  profile?: StudentProfile;
  job?: Job;
  category?: Category;
  match: ReturnType<typeof matchJob>;
};

export function buildRows(db: DB): ApplicantRow[] {
  return db.applications.map((app) => {
    const profile = db.profiles.find((p) => p.userId === app.studentId);
    const job = db.jobs.find((j) => j.id === app.jobId);
    return {
      app,
      user: db.users.find((u) => u.id === app.studentId),
      profile,
      job,
      category: db.categories.find((c) => c.id === job?.categoryId),
      match: job ? matchJob(profile, job) : { score: app.score, label: "Low", reasons: [], gaps: [] },
    };
  });
}
