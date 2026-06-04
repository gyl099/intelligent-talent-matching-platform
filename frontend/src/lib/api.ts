/**
 * API CLIENT — Intelligent Matching Platform
 *
 * This module is the single integration point with the Django REST backend.
 *
 * - When VITE_API_BASE_URL is set, all calls go to the Django server.
 * - When unset (default during frontend dev), an in-browser localStorage
 *   mock backend is used so the UI is fully clickable.
 *
 * The Django backend should expose the endpoints documented in
 * `API_CONTRACT.md` at the project root.
 */
import { mockApi } from "./mock-api";

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const USE_MOCK = !BASE_URL;

// --- Domain types (shared with backend contract) ---

export type Role = "candidate" | "employer";

export interface User {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  is_member: boolean;
  created_at: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  education: string;          // e.g. "Bachelor", "Master", "PhD", "Diploma"
  major?: string;
  years_experience: number;
  skills: string[];
  resume_url?: string;        // returned by upload endpoint
  resume_filename?: string;
}

export type WorkMode = "Remote" | "Hybrid" | "On-site";

export interface JobPosting {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  company_logo?: string;
  description: string;
  required_education: string;
  required_skills: string[];
  min_years_experience: number;
  work_mode: WorkMode;
  location: string;
  salary_min?: number | null;
  salary_max?: number | null;
  posted_at: string;
}

export interface JobMatch {
  job: JobPosting;
  score: number;            // 0..1
  reasons: string[];
}

export interface CandidateMatch {
  candidate: CandidateProfile;
  score: number;
  reasons: string[];
}

export interface JobApplication {
  id: string;
  job_id: string;
  candidate: CandidateProfile;
  applied_at: string;
}

// --- Auth token storage ---

const TOKEN_KEY = "imp.token";
const USER_KEY = "imp.user";

const hasLS = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

export const auth = {
  getToken: () => (hasLS() ? localStorage.getItem(TOKEN_KEY) : null),
  getUser: (): User | null => {
    if (!hasLS()) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setSession: (token: string, user: User) => {
    if (!hasLS()) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    if (!hasLS()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// --- HTTP helper ---

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = auth.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

function toQueryString(params: Record<string, unknown>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    qs.set(key, String(value));
  }
  const text = qs.toString();
  return text ? `?${text}` : "";
}

// --- Public API surface ---

export const api = {
  // Auth
  signup: (input: { email: string; password: string; full_name: string; role: Role }) =>
    USE_MOCK ? mockApi.signup(input) : http<{ token: string; user: User }>("/auth/signup/", { method: "POST", body: JSON.stringify(input) }),

  login: (input: { email: string; password: string }) =>
    USE_MOCK ? mockApi.login(input) : http<{ token: string; user: User }>("/auth/login/", { method: "POST", body: JSON.stringify(input) }),

  // Candidate profile
  getMyProfile: () =>
    USE_MOCK ? mockApi.getMyProfile() : http<CandidateProfile>("/candidates/me/"),

  updateMyProfile: (input: Partial<CandidateProfile>) =>
    USE_MOCK ? mockApi.updateMyProfile(input) : http<CandidateProfile>("/candidates/me/", { method: "PATCH", body: JSON.stringify(input) }),

  uploadResume: async (file: File): Promise<{ resume_url: string; resume_filename: string }> => {
    if (USE_MOCK) return mockApi.uploadResume(file);
    const fd = new FormData();
    fd.append("file", file);
    const token = auth.getToken();
    const res = await fetch(`${BASE_URL}/candidates/me/resume/`, {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  },

  // Membership
  activateMembership: () =>
    USE_MOCK ? mockApi.activateMembership() : http<{ is_member: boolean; user: User }>("/auth/membership/", { method: "POST", body: JSON.stringify({}) }),

  cancelMembership: () =>
    USE_MOCK ? mockApi.cancelMembership() : http<{ is_member: boolean; user: User }>("/auth/membership/", { method: "DELETE" }),

  // Jobs (public browsing + search)
  listJobs: (params: { q?: string; work_mode?: WorkMode; location?: string; salary_min?: number; salary_max?: number; required_education?: string } = {}) => {
    if (USE_MOCK) return mockApi.listJobs(params);
    return http<JobPosting[]>(`/jobs/${toQueryString(params)}`);
  },

  getJob: (id: string) =>
    USE_MOCK ? mockApi.getJob(id) : http<JobPosting>(`/jobs/${id}/`),

  // Recommendations (pass k=undefined for unlimited — members only)
  recommendedJobs: (k?: number) =>
    USE_MOCK ? mockApi.recommendedJobs(k) : http<JobMatch[]>(`/candidates/me/recommendations/${k != null ? `?k=${k}` : ""}`),

  // Employer
  createJob: (input: Omit<JobPosting, "id" | "employer_id" | "posted_at">) =>
    USE_MOCK ? mockApi.createJob(input) : http<JobPosting>("/jobs/", { method: "POST", body: JSON.stringify(input) }),

  updateJob: (id: string, input: Partial<Omit<JobPosting, "id" | "employer_id" | "posted_at">>) =>
    USE_MOCK ? mockApi.updateJob(id, input) : http<JobPosting>(`/jobs/${id}/`, { method: "PATCH", body: JSON.stringify(input) }),

  myJobs: () =>
    USE_MOCK ? mockApi.myJobs() : http<JobPosting[]>("/employers/me/jobs/"),

  deleteJob: (id: string) =>
    USE_MOCK ? mockApi.deleteJob(id) : http<void>(`/jobs/${id}/`, { method: "DELETE" }),

  searchCandidates: (params: { q?: string; skills?: string[]; education?: string; min_experience?: number; location?: string } = {}) => {
    if (USE_MOCK) return mockApi.searchCandidates(params);
    return http<CandidateProfile[]>(`/candidates/search/${toQueryString({
      q: params.q,
      skills: params.skills?.join(","),
      education: params.education,
      min_experience: params.min_experience,
      location: params.location,
    })}`);
  },

  // n=undefined means unlimited (members only)
  recommendedCandidates: (jobId: string, n?: number) =>
    USE_MOCK ? mockApi.recommendedCandidates(jobId, n) : http<CandidateMatch[]>(`/jobs/${jobId}/recommendations/${n != null ? `?n=${n}` : ""}`),

  applyToJob: (jobId: string) =>
    USE_MOCK ? mockApi.applyToJob(jobId) : http<JobApplication>(`/jobs/${jobId}/apply/`, { method: "POST", body: JSON.stringify({}) }),

  jobApplications: (jobId: string) =>
    USE_MOCK ? mockApi.jobApplications(jobId) : http<JobApplication[]>(`/jobs/${jobId}/applications/`),
};

export const isMockMode = USE_MOCK;
