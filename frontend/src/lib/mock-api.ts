/**
 * In-browser mock backend backed by localStorage.
 * Mirrors the Django REST contract documented in API_CONTRACT.md.
 *
 * Replace with real backend by setting VITE_API_BASE_URL.
 */
import type {
  CandidateMatch,
  CandidateProfile,
  JobApplication,
  JobMatch,
  JobPosting,
  Role,
  User,
  WorkMode,
} from "./api";
import { auth } from "./api";
import { seedJobs, seedCandidates } from "./seed-data";

const KEY = {
  users: "imp.db.users",
  candidates: "imp.db.candidates",
  jobs: "imp.db.jobs",
  applications: "imp.db.applications",
  passwords: "imp.db.passwords",
};

// --- Fuzzy search helper ---
// Matches all whitespace-separated query terms against a target string.
// Each term matches if it's a substring OR if any word in the target has
// a similarity ratio >= FUZZY_THRESHOLD (handles typos, abbreviations).

const FUZZY_THRESHOLD = 0.72;

function similarityRatio(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  let matches = 0;
  const used = new Array(longer.length).fill(false);
  for (let i = 0; i < shorter.length; i++) {
    for (let j = 0; j < longer.length; j++) {
      if (!used[j] && shorter[i] === longer[j]) { matches++; used[j] = true; break; }
    }
  }
  return (2.0 * matches) / (a.length + b.length);
}

function fuzzyMatch(query: string, text: string): boolean {
  const textLower = text.toLowerCase();
  const textTokens = textLower.match(/[a-z0-9#+.]+/g) ?? [];
  const terms = query.toLowerCase().match(/[a-z0-9#+.]+/g) ?? [];
  if (terms.length === 0) return true;
  return terms.every((term) => {
    if (textLower.includes(term)) return true;
    return textTokens.some((tok) => tok.length >= 3 && similarityRatio(term, tok) >= FUZZY_THRESHOLD);
  });
}

const hasLS = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

function read<T>(k: string, fallback: T): T {
  if (!hasLS()) return fallback;
  const raw = localStorage.getItem(k);
  return raw ? (JSON.parse(raw) as T) : fallback;
}
function write<T>(k: string, v: T) {
  if (!hasLS()) return;
  localStorage.setItem(k, JSON.stringify(v));
}

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

function ensureSeeded() {
  if (!hasLS()) return;
  if (localStorage.getItem("imp.seeded") === "1") return;
  const users: User[] = [];
  const candidates: CandidateProfile[] = [];
  const jobs: JobPosting[] = [];

  // Seed employers and their jobs
  for (const sj of seedJobs) {
    let employerId = users.find((u) => u.email === sj.employer_email)?.id;
    if (!employerId) {
      employerId = uid();
      users.push({
        id: employerId,
        email: sj.employer_email,
        role: "employer",
        full_name: sj.company,
        is_member: false,
        created_at: new Date().toISOString(),
      });
    }
    jobs.push({
      id: uid(),
      employer_id: employerId,
      title: sj.title,
      company: sj.company,
      description: sj.description,
      required_education: sj.required_education,
      required_skills: sj.required_skills,
      min_years_experience: sj.min_years_experience,
      work_mode: sj.work_mode,
      location: sj.location,
      salary_min: sj.salary_min,
      salary_max: sj.salary_max,
      posted_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 14).toISOString(),
    });
  }

  // Seed candidate profiles
  for (const sc of seedCandidates) {
    const userId = uid();
    users.push({
      id: userId,
      email: sc.email,
      role: "candidate",
      full_name: sc.full_name,
      is_member: false,
      created_at: new Date().toISOString(),
    });
    candidates.push({
      id: uid(),
      user_id: userId,
      ...sc,
    });
  }

  write(KEY.users, users);
  write(KEY.candidates, candidates);
  write(KEY.jobs, jobs);
  write(KEY.applications, []);
  write(KEY.passwords, {});
  localStorage.setItem("imp.seeded", "1");
}
ensureSeeded();

const delay = <T,>(v: T): Promise<T> => new Promise((r) => setTimeout(() => r(v), 180));

// --- Matching algorithm (transparent, rule-based) ---

function scoreJobForCandidate(job: JobPosting, c: CandidateProfile): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const cskills = new Set(c.skills.map((s) => s.toLowerCase()));
  const matchedSkills = job.required_skills.filter((s) => cskills.has(s.toLowerCase()));
  const skillRatio = job.required_skills.length ? matchedSkills.length / job.required_skills.length : 0;
  score += skillRatio * 0.55;
  if (matchedSkills.length) reasons.push(`${matchedSkills.length}/${job.required_skills.length} required skills match`);

  const eduRank: Record<string, number> = { Diploma: 1, Bachelor: 2, Master: 3, PhD: 4 };
  if ((eduRank[c.education] ?? 0) >= (eduRank[job.required_education] ?? 0)) {
    score += 0.2;
    reasons.push(`Meets ${job.required_education} education`);
  }

  if (c.years_experience >= job.min_years_experience) {
    score += 0.15;
    reasons.push(`${c.years_experience}y experience ≥ ${job.min_years_experience}y required`);
  } else {
    score += Math.max(0, 0.15 * (c.years_experience / Math.max(1, job.min_years_experience)));
  }

  if (c.location && job.location && c.location.toLowerCase().includes(job.location.split(",")[0].toLowerCase())) {
    score += 0.05;
    reasons.push("Same location");
  }
  if (job.work_mode === "Remote") {
    score += 0.05;
    reasons.push("Remote-friendly");
  }

  return { score: Math.min(1, score), reasons };
}

// --- Handlers ---

export const mockApi = {
  async signup(input: { email: string; password: string; full_name: string; role: Role }) {
    const users = read<User[]>(KEY.users, []);
    if (users.find((u) => u.email === input.email)) throw new Error("Email already registered");

    const user: User = {
      id: uid(),
      email: input.email,
      role: input.role,
      full_name: input.full_name,
      is_member: false,
      created_at: new Date().toISOString(),
    };
    users.push(user);
    write(KEY.users, users);

    const pwds = read<Record<string, string>>(KEY.passwords, {});
    pwds[input.email] = input.password;
    write(KEY.passwords, pwds);

    if (input.role === "candidate") {
      const candidates = read<CandidateProfile[]>(KEY.candidates, []);
      candidates.push({
        id: uid(),
        user_id: user.id,
        full_name: input.full_name,
        email: input.email,
        education: "Bachelor",
        years_experience: 0,
        skills: [],
      });
      write(KEY.candidates, candidates);
    }

    const token = `mock.${user.id}`;
    return delay({ token, user });
  },

  async login(input: { email: string; password: string }) {
    const users = read<User[]>(KEY.users, []);
    const user = users.find((u) => u.email === input.email);
    const pwds = read<Record<string, string>>(KEY.passwords, {});
    if (!user) throw new Error("Account not found");
    // Seeded accounts have no password — allow any pw for demo accounts
    if (pwds[input.email] && pwds[input.email] !== input.password) throw new Error("Incorrect password");
    const token = `mock.${user.id}`;
    return delay({ token, user });
  },

  async getMyProfile(): Promise<CandidateProfile> {
    const u = auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const candidates = read<CandidateProfile[]>(KEY.candidates, []);
    const c = candidates.find((x) => x.user_id === u.id);
    if (!c) throw new Error("Profile not found");
    return delay(c);
  },

  async updateMyProfile(input: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const u = auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const candidates = read<CandidateProfile[]>(KEY.candidates, []);
    const idx = candidates.findIndex((x) => x.user_id === u.id);
    if (idx === -1) throw new Error("Profile not found");
    candidates[idx] = { ...candidates[idx], ...input };
    write(KEY.candidates, candidates);
    return delay(candidates[idx]);
  },

  async uploadResume(file: File) {
    // Mock: just record the filename; backend would persist & possibly parse.
    const u = auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const candidates = read<CandidateProfile[]>(KEY.candidates, []);
    const idx = candidates.findIndex((x) => x.user_id === u.id);
    if (idx !== -1) {
      candidates[idx].resume_filename = file.name;
      candidates[idx].resume_url = `mock://resume/${file.name}`;
      write(KEY.candidates, candidates);
    }
    return delay({ resume_url: `mock://resume/${file.name}`, resume_filename: file.name });
  },

  async listJobs(params: { q?: string; work_mode?: WorkMode; location?: string; salary_min?: number; salary_max?: number; required_education?: string }) {
    const jobs = read<JobPosting[]>(KEY.jobs, []);
    return delay(
      jobs
        .filter((j) => {
          if (params.work_mode && j.work_mode !== params.work_mode) return false;
          if (params.location && !j.location.toLowerCase().includes(params.location.toLowerCase())) return false;
          if (params.required_education && j.required_education !== params.required_education) return false;
          if (params.salary_min != null && (j.salary_max == null || j.salary_max < params.salary_min)) return false;
          if (params.salary_max != null && (j.salary_min == null || j.salary_min > params.salary_max)) return false;
          if (params.q) {
            const hay = `${j.title} ${j.company} ${j.description} ${j.location} ${j.required_skills.join(" ")}`;
            if (!fuzzyMatch(params.q, hay)) return false;
          }
          return true;
        })
        .sort((a, b) => b.posted_at.localeCompare(a.posted_at))
    );
  },

  async getJob(id: string) {
    const jobs = read<JobPosting[]>(KEY.jobs, []);
    const j = jobs.find((x) => x.id === id);
    if (!j) throw new Error("Job not found");
    return delay(j);
  },

  async recommendedJobs(k?: number): Promise<JobMatch[]> {
    const u = auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const candidates = read<CandidateProfile[]>(KEY.candidates, []);
    const c = candidates.find((x) => x.user_id === u.id);
    if (!c) throw new Error("Profile not found");
    const jobs = read<JobPosting[]>(KEY.jobs, []);
    const ranked = jobs
      .map((job) => ({ job, ...scoreJobForCandidate(job, c) }))
      .sort((a, b) => b.score - a.score);
    // Members (is_member=true) get all results; non-members capped at 10
    const limit = u.is_member ? undefined : (k ?? 10);
    return delay(limit != null ? ranked.slice(0, limit) : ranked);
  },

  async createJob(input: Omit<JobPosting, "id" | "employer_id" | "posted_at">) {
    const u = auth.getUser();
    if (!u || u.role !== "employer") throw new Error("Employer account required");
    const jobs = read<JobPosting[]>(KEY.jobs, []);
    const myJobs = jobs.filter((j) => j.employer_id === u.id);
    const jobLimit = u.is_member ? 3 : 1;
    if (myJobs.length >= jobLimit) {
      const label = u.is_member ? "Member" : "Non-member";
      throw new Error(`Job posting limit reached. ${label} accounts may post up to ${jobLimit} job${jobLimit > 1 ? "s" : ""}.`);
    }
    const j: JobPosting = {
      ...input,
      id: uid(),
      employer_id: u.id,
      posted_at: new Date().toISOString(),
      company: input.company || u.full_name,
    };
    jobs.unshift(j);
    write(KEY.jobs, jobs);
    return delay(j);
  },

  async updateJob(id: string, input: Partial<Omit<JobPosting, "id" | "employer_id" | "posted_at">>) {
    const u = auth.getUser();
    if (!u || u.role !== "employer") throw new Error("Employer account required");
    const jobs = read<JobPosting[]>(KEY.jobs, []);
    const idx = jobs.findIndex((j) => j.id === id && j.employer_id === u.id);
    if (idx === -1) throw new Error("Job not found");
    jobs[idx] = { ...jobs[idx], ...input };
    write(KEY.jobs, jobs);
    return delay(jobs[idx]);
  },

  async myJobs() {
    const u = auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const jobs = read<JobPosting[]>(KEY.jobs, []);
    return delay(jobs.filter((j) => j.employer_id === u.id).sort((a, b) => b.posted_at.localeCompare(a.posted_at)));
  },

  async deleteJob(id: string) {
    const u = auth.getUser();
    if (!u || u.role !== "employer") throw new Error("Employer account required");
    const jobs = read<JobPosting[]>(KEY.jobs, []);
    const idx = jobs.findIndex((j) => j.id === id && j.employer_id === u.id);
    if (idx === -1) throw new Error("Job not found");
    jobs.splice(idx, 1);
    write(KEY.jobs, jobs);
    // Remove applications for this job
    const applications = read<JobApplication[]>(KEY.applications, []);
    write(KEY.applications, applications.filter((a) => a.job_id !== id));
    return delay(undefined);
  },

  async searchCandidates(params: { q?: string; skills?: string[]; education?: string; min_experience?: number; location?: string }) {
    const candidates = read<CandidateProfile[]>(KEY.candidates, []);
    return delay(
      candidates.filter((c) => {
        if (params.education && c.education !== params.education) return false;
        if (params.min_experience != null && c.years_experience < params.min_experience) return false;
        if (params.location && !(c.location ?? "").toLowerCase().includes(params.location.toLowerCase())) return false;
        if (params.skills?.length) {
          const cs = new Set(c.skills.map((s) => s.toLowerCase()));
          if (!params.skills.every((s) => cs.has(s.toLowerCase()))) return false;
        }
        if (params.q) {
          const hay = `${c.full_name} ${c.headline ?? ""} ${c.bio ?? ""} ${c.major ?? ""} ${c.location ?? ""} ${c.skills.join(" ")}`;
          if (!fuzzyMatch(params.q, hay)) return false;
        }
        return true;
      })
    );
  },

  async recommendedCandidates(jobId: string, n?: number): Promise<CandidateMatch[]> {
    const u = auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const jobs = read<JobPosting[]>(KEY.jobs, []);
    const job = jobs.find((j) => j.id === jobId);
    if (!job) throw new Error("Job not found");
    const candidates = read<CandidateProfile[]>(KEY.candidates, []);
    const ranked = candidates
      .map((c) => ({ candidate: c, ...scoreJobForCandidate(job, c) }))
      .sort((a, b) => b.score - a.score);
    // Members get all results; non-members capped at 10
    const limit = u.is_member ? undefined : (n ?? 10);
    return delay(limit != null ? ranked.slice(0, limit) : ranked);
  },

  async applyToJob(jobId: string): Promise<JobApplication> {
    const u = auth.getUser();
    if (!u || u.role !== "candidate") throw new Error("Candidate account required");

    const jobs = read<JobPosting[]>(KEY.jobs, []);
    const job = jobs.find((j) => j.id === jobId);
    if (!job) throw new Error("Job not found");

    const candidates = read<CandidateProfile[]>(KEY.candidates, []);
    const candidate = candidates.find((c) => c.user_id === u.id);
    if (!candidate) throw new Error("Profile not found");

    const applications = read<JobApplication[]>(KEY.applications, []);
    const existing = applications.find((a) => a.job_id === jobId && a.candidate.user_id === u.id);
    if (existing) return delay(existing);

    const application: JobApplication = {
      id: uid(),
      job_id: jobId,
      candidate,
      applied_at: new Date().toISOString(),
    };
    applications.unshift(application);
    write(KEY.applications, applications);
    return delay(application);
  },

  async jobApplications(jobId: string): Promise<JobApplication[]> {
    const u = auth.getUser();
    if (!u || u.role !== "employer") throw new Error("Employer account required");

    const jobs = read<JobPosting[]>(KEY.jobs, []);
    const job = jobs.find((j) => j.id === jobId && j.employer_id === u.id);
    if (!job) throw new Error("Job not found");

    const applications = read<JobApplication[]>(KEY.applications, []);
    return delay(applications.filter((a) => a.job_id === jobId));
  },

  async activateMembership() {
    const u = auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const users = read<User[]>(KEY.users, []);
    const idx = users.findIndex((x) => x.id === u.id);
    if (idx !== -1) { users[idx].is_member = true; write(KEY.users, users); }
    const updated = { ...u, is_member: true };
    auth.setSession(auth.getToken()!, updated);
    return delay({ is_member: true, user: updated });
  },

  async cancelMembership() {
    const u = auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const users = read<User[]>(KEY.users, []);
    const idx = users.findIndex((x) => x.id === u.id);
    if (idx !== -1) { users[idx].is_member = false; write(KEY.users, users); }
    const updated = { ...u, is_member: false };
    auth.setSession(auth.getToken()!, updated);
    return delay({ is_member: false, user: updated });
  },
};
