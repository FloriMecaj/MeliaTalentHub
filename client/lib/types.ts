export type Role = "student" | "admin";
export type Season = "summer" | "winter" | "year";

export type User = {
  id: string;
  role: Role;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type StudentProfile = {
  userId: string;
  occupation: "student" | "graduate" | "working" | "seeking";
  field: string;
  city: string;
  categoryIds: string[];
  skills: string[];
  languages: string[];
  experienceYears: number;
  availability: Season;
  workedAtMelia: boolean;
  about: string;
  savedJobIds?: string[];
  cv?: { name: string; size: number; dataUrl?: string };
};

export type Category = {
  id: string;
  name: string;
  description: string;
  /** headcount wanted for the coming season */
  target?: number;
  color?: string;
};

export type Job = {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  requiredSkills: string[];
  languages: string[];
  minExperience: number;
  positions: number;
  season: Season;
  location: string;
  status: "open" | "closed";
  deadline?: string;
  createdAt: string;
};

export type Stage = "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
export const STAGES: Stage[] = ["new", "screening", "interview", "offer", "hired", "rejected"];

export type Note = { id: string; text: string; at: string };

export type Application = {
  id: string;
  jobId: string;
  studentId: string;
  score: number;
  /** derived from stage; kept for the student-facing views */
  status: "pending" | "accepted" | "rejected";
  stage: Stage;
  notes: Note[];
  interviewAt?: string;
  createdAt: string;
};

export type WorkerStatus =
  | "available"
  | "invited"
  | "confirmed"
  | "declined"
  | "exchange";

/** A person who worked at Meliá last season. May be linked to a student account by email. */
export type Worker = {
  id: string;
  name: string;
  email: string;
  phone: string;
  categoryId: string;
  rating: number; // 1-5
  yearsAtMelia: number;
  status: WorkerStatus;
  tags: string[];
  notes: string;
  lastContactedAt?: string;
  declineReason?: string;
};

export type Message = {
  id: string;
  workerId: string;
  channel: "WhatsApp" | "App";
  kind: "invitation" | "exchange" | "general";
  body: string;
  createdAt: string;
  read: boolean;
  campaignId?: string;
};

export type Partner = {
  id: string;
  name: string;
  city: string;
  type: string;
  contact: string;
  capacity: number;
};

export type Exchange = {
  id: string;
  workerId: string;
  partnerId: string;
  from: string;
  to: string;
  notes: string;
  status: "proposed" | "confirmed" | "active" | "returned" | "cancelled";
  salary: number;
  housing: boolean;
  transport: boolean;
  createdAt: string;
};

export type Campaign = {
  id: string;
  name: string;
  season: string;
  channel: Message["channel"];
  template: string;
  deadline?: string;
  workerIds: string[];
  createdAt: string;
};

export type MessageTemplate = { id: string; name: string; body: string };
export type ActivityItem = { id: string; at: string; text: string };
export type Settings = { season: string };

export type DB = {
  users: User[];
  profiles: StudentProfile[];
  categories: Category[];
  jobs: Job[];
  applications: Application[];
  workers: Worker[];
  messages: Message[];
  partners: Partner[];
  exchanges: Exchange[];
  campaigns: Campaign[];
  templates: MessageTemplate[];
  activity: ActivityItem[];
  settings: Settings;
};
