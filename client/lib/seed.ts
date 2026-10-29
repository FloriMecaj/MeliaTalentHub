import { matchJob } from "./match";
import type { Application, DB, Exchange, StudentProfile, User, Worker } from "./types";

// SHA-256 of "admin123" / "student123" (see lib/auth.ts)
const ADMIN_HASH =
  "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
const STUDENT_HASH =
  "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b";

const cat = {
  fo: "cat-front-office",
  hk: "cat-housekeeping",
  fb: "cat-food-beverage",
  kt: "cat-kitchen",
  sp: "cat-spa-wellness",
  an: "cat-animation",
};

const names = [
  "Elira Hoxha", "Arben Dervishi", "Klea Marku", "Dorian Basha", "Sara Gjoni",
  "Besnik Leka", "Ina Shehu", "Ergi Duka", "Mira Kola", "Nikolin Prifti",
  "Alba Cela", "Redi Mema", "Enea Rama", "Jona Tafa", "Gent Hysa",
  "Lara Bega", "Olti Zeka", "Anisa Meta", "Dea Kurti", "Fation Roka",
  "Brikena Gura", "Xhoi Alia", "Ledia Nela", "Marsel Pema", "Sidorela Koci",
  "Ergest Halili", "Xhesika Tola", "Altin Mullai", "Greta Shkodra", "Kristi Veli",
  "Rea Ndreu", "Dritan Selmani", "Olsi Canaj", "Eliona Xhafa", "Joni Breshani",
  "Megi Aliu", "Orgest Lami", "Fjona Rexha", "Stivi Kasa", "Daniela Peci",
];
const catOrder = [cat.hk, cat.fb, cat.hk, cat.kt, cat.fo, cat.fb, cat.hk, cat.kt];

const workers: Worker[] = names.map((name, i) => ({
  id: `w-${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@mail.al`,
  phone: `+35569${String(1000000 + i * 37311).slice(0, 7)}`,
  categoryId:
    i % 9 === 8 ? cat.an : i % 7 === 6 ? cat.sp : catOrder[i % catOrder.length],
  rating: 3 + ((i * 7) % 3),
  yearsAtMelia: 1 + (i % 4),
  status: "available",
  tags: i % 5 === 0 ? ["top performer"] : i % 7 === 3 ? ["multilingual"] : [],
  notes: "",
}));

// Demo student's past-worker record (linked by email)
workers[0] = {
  ...workers[0],
  name: "Demo Student",
  email: "student@melia.al",
  categoryId: cat.fo,
  rating: 5,
  yearsAtMelia: 2,
};

type DemoStudent = {
  name: string; occupation: StudentProfile["occupation"]; field: string; city: string;
  categoryIds: string[]; skills: string[]; languages: string[]; exp: number;
  availability: StudentProfile["availability"]; melia: boolean; cv: boolean;
  applies: [jobId: string, status: Application["status"]][];
};

const DEMO: DemoStudent[] = [
  { name: "Elona Hasani", occupation: "student", field: "Tourism", city: "Tiranë", categoryIds: [cat.fo], skills: ["Customer service", "Reservations", "Excel"], languages: ["Albanian", "English", "Italian"], exp: 1, availability: "year", melia: false, cv: true, applies: [["j-1", "pending"]] },
  { name: "Gerti Mucaj", occupation: "graduate", field: "Hospitality Management", city: "Durrës", categoryIds: [cat.fo, cat.fb], skills: ["Customer service", "Reservations"], languages: ["Albanian", "English"], exp: 2, availability: "year", melia: true, cv: true, applies: [["j-1", "accepted"], ["j-2", "pending"]] },
  { name: "Silvana Bardhi", occupation: "student", field: "Culinary Arts", city: "Shkodër", categoryIds: [cat.kt], skills: ["Food safety", "Knife skills", "Teamwork"], languages: ["Albanian", "English"], exp: 1, availability: "summer", melia: false, cv: false, applies: [["j-4", "pending"]] },
  { name: "Aldo Preka", occupation: "seeking", field: "General", city: "Vlorë", categoryIds: [cat.hk], skills: ["Teamwork"], languages: ["Albanian"], exp: 0, availability: "summer", melia: false, cv: false, applies: [["j-3", "pending"], ["j-2", "rejected"]] },
  { name: "Mirela Zogaj", occupation: "student", field: "Tourism", city: "Durrës", categoryIds: [cat.fb, cat.an], skills: ["Customer service", "Teamwork", "Cash handling", "Public speaking"], languages: ["Albanian", "English", "German"], exp: 1, availability: "summer", melia: true, cv: true, applies: [["j-2", "accepted"], ["j-5", "pending"]] },
  { name: "Kristian Doka", occupation: "working", field: "Retail", city: "Tiranë", categoryIds: [cat.fb], skills: ["Customer service", "Cash handling"], languages: ["Albanian", "English"], exp: 3, availability: "year", melia: false, cv: true, applies: [["j-2", "pending"], ["j-1", "rejected"]] },
  { name: "Anxhela Troka", occupation: "student", field: "Psychology", city: "Elbasan", categoryIds: [cat.an], skills: ["Creativity", "Public speaking", "First aid"], languages: ["Albanian", "English", "Italian"], exp: 0, availability: "summer", melia: false, cv: false, applies: [["j-5", "pending"]] },
  { name: "Rexhi Lala", occupation: "graduate", field: "Hotel Operations", city: "Durrës", categoryIds: [cat.hk, cat.fo], skills: ["Attention to detail", "Teamwork", "Customer service"], languages: ["Albanian", "English"], exp: 2, availability: "year", melia: true, cv: true, applies: [["j-3", "accepted"], ["j-1", "pending"]] },
];

/** Demo applicants so the admin Applicants page isn't empty. */
export function demoApplicants(jobs: DB["jobs"]) {
  const users: User[] = [];
  const profiles: StudentProfile[] = [];
  const applications: Application[] = [];
  DEMO.forEach((d, i) => {
    const id = `u-demo-${i + 1}`;
    users.push({
      id, role: "student", name: d.name,
      email: `${d.name.toLowerCase().replace(/[^a-z]+/g, ".")}@mail.al`,
      passwordHash: STUDENT_HASH, createdAt: "2026-02-10T00:00:00.000Z",
    });
    const profile: StudentProfile = {
      userId: id, occupation: d.occupation, field: d.field, city: d.city,
      categoryIds: d.categoryIds, skills: d.skills, languages: d.languages,
      experienceYears: d.exp, availability: d.availability, workedAtMelia: d.melia,
      about: "", cv: d.cv ? { name: `${d.name.replace(" ", "_")}_CV.pdf`, size: 184000 } : undefined,
    };
    profiles.push(profile);
    d.applies.forEach(([jobId, status], k) => {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;
      const pendingStages: Application["stage"][] = ["new", "screening", "interview"];
      const stage: Application["stage"] =
        status === "accepted" ? (k % 2 ? "offer" : "hired") : status === "rejected" ? "rejected" : pendingStages[(i + k) % 3];
      applications.push({
        id: `a-demo-${i + 1}-${k + 1}`, jobId, studentId: id,
        score: matchJob(profile, job).score, stage,
        status: stage === "hired" ? "accepted" : stage === "rejected" ? "rejected" : "pending",
        notes: stage === "interview" ? [{ id: `n-${i}-${k}`, text: "Strong phone screen, schedule on-site.", at: "2026-02-20T09:00:00.000Z" }] : [],
        interviewAt: stage === "interview" ? "2026-11-05" : undefined,
        createdAt: `2026-02-${String(12 + i).padStart(2, "0")}T10:00:00.000Z`,
      });
    });
  });
  return { users, profiles, applications };
}

export const seedDb = (): DB => withDemo({
  users: [
    {
      id: "u-admin",
      role: "admin",
      name: "Meliá HR",
      email: "admin@melia.al",
      passwordHash: ADMIN_HASH,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "u-student",
      role: "student",
      name: "Demo Student",
      email: "student@melia.al",
      passwordHash: STUDENT_HASH,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  profiles: [
    {
      userId: "u-student",
      occupation: "student",
      field: "Tourism & Hospitality",
      city: "Durrës",
      categoryIds: [cat.fo, cat.fb],
      skills: ["Customer service", "Reservations", "Excel"],
      languages: ["Albanian", "English", "Italian"],
      experienceYears: 2,
      availability: "year",
      workedAtMelia: true,
      about: "Hospitality student looking for a year-round career.",
    },
  ],
  categories: [
    { id: cat.fo, name: "Front Office", description: "Reception, concierge and reservations.", target: 6 },
    { id: cat.hk, name: "Housekeeping", description: "Rooms, laundry and public areas.", target: 12 },
    { id: cat.fb, name: "Food & Beverage", description: "Restaurant, bar and banqueting service.", target: 10 },
    { id: cat.kt, name: "Kitchen", description: "Culinary brigade and prep.", target: 8 },
    { id: cat.sp, name: "Spa & Wellness", description: "Therapists, pool and fitness.", target: 5 },
    { id: cat.an, name: "Animation", description: "Guest entertainment and kids club.", target: 4 },
  ],
  jobs: [
    {
      id: "j-1", title: "Receptionist", categoryId: cat.fo,
      description: "Front desk check-in/out, guest requests and reservations.",
      requiredSkills: ["Customer service", "Reservations", "Excel"],
      languages: ["English", "Italian"], minExperience: 1, positions: 6,
      season: "year", location: "Meliá Durrës", status: "open", createdAt: "2026-02-01T00:00:00.000Z",
    },
    {
      id: "j-2", title: "Waiter / Waitress", categoryId: cat.fb,
      description: "Restaurant and poolside service during peak season.",
      requiredSkills: ["Customer service", "Teamwork", "Cash handling"],
      languages: ["English"], minExperience: 0, positions: 20,
      season: "summer", location: "Meliá Durrës", status: "open", createdAt: "2026-02-02T00:00:00.000Z",
    },
    {
      id: "j-3", title: "Room Attendant", categoryId: cat.hk,
      description: "Clean and prepare guest rooms to Meliá standards.",
      requiredSkills: ["Attention to detail", "Teamwork"],
      languages: ["Albanian"], minExperience: 0, positions: 30,
      season: "summer", location: "Meliá Durrës", status: "open", createdAt: "2026-02-03T00:00:00.000Z",
    },
    {
      id: "j-4", title: "Commis Chef", categoryId: cat.kt,
      description: "Support hot and cold stations in the main kitchen.",
      requiredSkills: ["Food safety", "Knife skills", "Teamwork"],
      languages: ["Albanian", "English"], minExperience: 1, positions: 8,
      season: "summer", location: "Meliá Durrës", status: "open", createdAt: "2026-02-04T00:00:00.000Z",
    },
    {
      id: "j-5", title: "Guest Experience Host", categoryId: cat.an,
      description: "Run daily activities and the kids club.",
      requiredSkills: ["Public speaking", "Creativity", "First aid"],
      languages: ["English", "Italian"], minExperience: 0, positions: 5,
      season: "summer", location: "Meliá Durrës", status: "open", createdAt: "2026-02-05T00:00:00.000Z",
    },
  ],
  applications: [],
  workers,
  messages: [],
  campaigns: [],
  templates: [],
  activity: [],
  settings: { season: "Summer 2027" },
  partners: [
    { id: "p-1", name: "Meliá Sierra Nevada", city: "Granada, ES", type: "Ski resort", contact: "hr@sierra.example", capacity: 6 },
    { id: "p-2", name: "Meliá Vienna", city: "Vienna, AT", type: "City hotel", contact: "hr@vienna.example", capacity: 4 },
    { id: "p-3", name: "Hotel Alpenhof", city: "Zermatt, CH", type: "Partner resort", contact: "jobs@alpenhof.example", capacity: 5 },
    { id: "p-4", name: "Dubai Marina Suites", city: "Dubai, AE", type: "Partner hotel", contact: "talent@dms.example", capacity: 3 },
  ],
  exchanges: [],
});

function withDemo(db: DB): DB {
  const demo = demoApplicants(db.jobs);
  db.users.push(...demo.users);
  db.profiles.push(...demo.profiles);
  db.applications.push(...demo.applications);
  enrich(db);
  upgradeDb(db);
  return db;
}

export const DEFAULT_TEMPLATES = [
  {
    id: "t-welcome-back",
    name: "Welcome back",
    body: "Hi {name}, thank you for your great work last season! We'd love to have you back in {category} for {season}. Please reply by {deadline}.",
  },
  {
    id: "t-short",
    name: "Short & friendly",
    body: "Hey {name}! Meliá Durrës wants you back for {season} ({category}). Confirm in the app by {deadline}.",
  },
  {
    id: "t-reminder",
    name: "Reminder",
    body: "Hi {name}, a quick reminder: your spot in {category} for {season} is waiting. Please confirm by {deadline}.",
  },
];

/** Richer demo state for a fresh database: a live campaign, exchanges, activity. */
function enrich(db: DB) {
  const set = (ids: string[], status: Worker["status"]) =>
    ids.forEach((id) => {
      const w = db.workers.find((x) => x.id === id);
      if (w) w.status = status;
    });
  set(["w-2", "w-3", "w-5", "w-8", "w-11", "w-14", "w-18"], "confirmed");
  set(["w-1", "w-4", "w-6", "w-9", "w-12"], "invited");
  set(["w-7", "w-10", "w-13"], "declined");
  set(["w-15", "w-16", "w-17"], "exchange");
  const reasons: Record<string, string> = { "w-7": "Studying abroad", "w-10": "Found a year-round job", "w-13": "Family reasons" };
  Object.entries(reasons).forEach(([id, r]) => {
    const w = db.workers.find((x) => x.id === id);
    if (w) w.declineReason = r;
  });

  const ids = ["w-1", "w-2", "w-3", "w-5", "w-8", "w-11", "w-14", "w-4", "w-6", "w-9", "w-12", "w-7", "w-10", "w-13"];
  const season = "Summer 2027";
  const tpl = DEFAULT_TEMPLATES[0].body;
  db.campaigns.push({
    id: "c-1", name: "Early invitations", season, channel: "WhatsApp", template: tpl,
    deadline: "2026-11-20", workerIds: ids, createdAt: "2026-10-20T09:00:00.000Z",
  });
  ids.forEach((id, n) => {
    const w = db.workers.find((x) => x.id === id)!;
    const category = db.categories.find((c) => c.id === w.categoryId)?.name ?? "";
    w.lastContactedAt = "2026-10-20T09:00:00.000Z";
    db.messages.push({
      id: `m-seed-${n}`, workerId: id, channel: "WhatsApp", kind: "invitation", campaignId: "c-1",
      body: tpl.replaceAll("{name}", w.name.split(" ")[0]).replaceAll("{category}", category)
        .replaceAll("{season}", season).replaceAll("{deadline}", "2026-11-20"),
      createdAt: "2026-10-20T09:00:00.000Z", read: id !== "w-1",
    });
  });

  db.applications.push(
    { id: "a-demo-self-1", jobId: "j-2", studentId: "u-student", score: 85, stage: "screening", status: "pending", notes: [], createdAt: "2026-10-22T10:00:00.000Z" },
    { id: "a-demo-self-2", jobId: "j-1", studentId: "u-student", score: 100, stage: "interview", status: "pending", notes: [], interviewAt: "2026-11-12", createdAt: "2026-10-18T10:00:00.000Z" },
  );

  const mk = (id: string, workerId: string, partnerId: string, from: string, to: string, status: Exchange["status"], salary: number, housing: boolean, transport: boolean, notes: string): Exchange => ({
    id, workerId, partnerId, from, to, status, salary, housing, transport, notes, createdAt: "2026-10-15T09:00:00.000Z",
  });
  db.exchanges.push(
    mk("x-1", "w-15", "p-1", "2026-11-15", "2027-03-31", "active", 1400, true, true, "Ski season, front desk support."),
    mk("x-2", "w-16", "p-2", "2026-11-10", "2027-02-28", "active", 1650, true, false, "City hotel, housekeeping."),
    mk("x-3", "w-17", "p-3", "2026-10-25", "2026-11-08", "active", 1200, false, true, "Short training stint."),
    mk("x-4", "w-18", "p-4", "2026-12-01", "2027-03-15", "confirmed", 1800, true, true, "Awaiting final contract."),
  );
  db.activity.push(
    { id: "act-1", at: "2026-10-28T16:40:00.000Z", text: "Campaign “Early invitations” sent to 13 workers" },
    { id: "act-2", at: "2026-10-27T11:05:00.000Z", text: `Exchange created: ${db.workers.find((w) => w.id === "w-18")?.name} to Dubai Marina Suites` },
    { id: "act-3", at: "2026-10-26T09:20:00.000Z", text: "Category targets updated for Summer 2027" },
  );
}

type Loose = Partial<DB> & {
  workers: Worker[]; applications: Application[]; partners: DB["partners"]; exchanges: Exchange[];
};

/** Fills fields added after a database was first saved. Returns true if it changed anything. */
export function upgradeDb(db: DB): boolean {
  const d = db as unknown as Loose & Record<string, unknown>;
  let changed = false;
  const fill = <T extends object>(o: T, patch: Partial<T>) => {
    for (const [k, v] of Object.entries(patch)) {
      if ((o as Record<string, unknown>)[k] === undefined) {
        (o as Record<string, unknown>)[k] = v;
        changed = true;
      }
    }
  };
  if (!db.users.some((u) => u.id === "u-demo-1")) {
    const demo = demoApplicants(db.jobs);
    db.users.push(...demo.users);
    db.profiles.push(...demo.profiles);
    db.applications.push(...demo.applications);
    changed = true;
  }
  db.workers.forEach((w) => fill(w, { tags: [], notes: "" }));
  db.applications.forEach((a) =>
    fill(a, {
      stage: a.status === "accepted" ? "hired" : a.status === "rejected" ? "rejected" : "new",
      notes: [],
    }),
  );
  db.partners.forEach((p) => fill(p, { capacity: 5 }));
  db.exchanges.forEach((x) => fill(x, { salary: 0, housing: false, transport: false }));
  if (!d.campaigns) { d.campaigns = []; changed = true; }
  if (!d.templates || d.templates.length === 0) { d.templates = DEFAULT_TEMPLATES.map((t) => ({ ...t })); changed = true; }
  if (!d.activity) { d.activity = []; changed = true; }
  if (!d.settings) { d.settings = { season: "Summer 2027" }; changed = true; }
  return changed;
}
