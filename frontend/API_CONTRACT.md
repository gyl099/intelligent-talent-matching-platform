# Django REST API Contract — Intelligent Matching Platform

The React frontend in this project talks to a Django backend through the
single client in `src/lib/api.ts`. While `VITE_API_BASE_URL` is unset, an
in-browser mock backend (localStorage) is used so the UI is fully clickable
during development.

When your Django backend is ready, set:

```
VITE_API_BASE_URL=https://your-django.example.com/api
```

…and the same UI will hit your real endpoints with zero code changes.

---

## Conventions

- All endpoints under `/api/`.
- All request and response bodies are JSON unless noted (resume upload is multipart).
- Authenticated endpoints require `Authorization: Bearer <token>`.
- Timestamps are ISO 8601 strings.

---

## Auth

### `POST /auth/signup/`
**Body:** `{ email, password, full_name, role: "candidate" | "employer" }`
**Response 200:** `{ token: string, user: User }`
- For `role=candidate`, also create an empty `CandidateProfile` linked to the user.

### `POST /auth/login/`
**Body:** `{ email, password }`
**Response 200:** `{ token: string, user: User }`

---

## Candidate

### `GET /candidates/me/` (auth: candidate)
**Response 200:** `CandidateProfile`

### `PATCH /candidates/me/` (auth: candidate)
**Body:** Partial `CandidateProfile`
**Response 200:** updated `CandidateProfile`

### `POST /candidates/me/resume/` (auth: candidate, multipart/form-data)
**Body:** `file` field containing a PDF.
**Response 200:** `{ resume_url: string, resume_filename: string }`
- Persist file to storage (S3 / Django default storage). Optional: parse PDF and pre-fill fields.

### `GET /candidates/me/recommendations/?k=10` (auth: candidate)
**Response 200:** `JobMatch[]` — Top-K most relevant jobs for the authenticated candidate.
- Scoring algorithm is documented below.

---

## Jobs (public)

### `GET /jobs/?q=&work_mode=&location=`
**Response 200:** `JobPosting[]` — newest first.

### `GET /jobs/:id/`
**Response 200:** `JobPosting`

---

## Employer

### `POST /jobs/` (auth: employer)
**Body:** All `JobPosting` fields except `id`, `employer_id`, `posted_at`.
**Response 200:** created `JobPosting`

### `GET /employers/me/jobs/` (auth: employer)
**Response 200:** `JobPosting[]` owned by current employer.

### `GET /candidates/search/?q=&skills=react,python&education=Bachelor&min_experience=2` (auth: employer)
**Response 200:** `CandidateProfile[]`
- `skills` is comma-separated; ALL listed skills must match (case-insensitive).
- `min_experience` is a lower bound (inclusive).

### `GET /jobs/:id/recommendations/?n=10` (auth: employer who owns the job)
**Response 200:** `CandidateMatch[]` — Top-N candidates ranked for the posting.

---

## Domain Models

### `User`
```ts
{
  id: string;
  email: string;
  role: "candidate" | "employer";
  full_name: string;
  created_at: string;
}
```

### `CandidateProfile`
```ts
{
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  education: "Diploma" | "Bachelor" | "Master" | "PhD";
  major?: string;
  years_experience: number;
  skills: string[];
  resume_url?: string;
  resume_filename?: string;
}
```

### `JobPosting`
```ts
{
  id: string;
  employer_id: string;
  title: string;
  company: string;
  company_logo?: string;
  description: string;
  required_education: "Diploma" | "Bachelor" | "Master" | "PhD";
  required_skills: string[];
  min_years_experience: number;
  work_mode: "Remote" | "Hybrid" | "On-site";
  location: string;
  salary_min?: number;
  salary_max?: number;
  posted_at: string;
}
```

### `JobMatch` / `CandidateMatch`
```ts
{ job: JobPosting; score: number; reasons: string[] }
{ candidate: CandidateProfile; score: number; reasons: string[] }
```

---

## Recommended scoring algorithm (rule-based)

Implement on Django side (e.g. in a `matching.py` service) so it matches the
frontend's mock for parity:

```
score = 0
skill_ratio   = matched_required_skills / total_required_skills
score += 0.55 * skill_ratio

if candidate.education >= job.required_education:   # by rank D<B<M<P
    score += 0.20

if candidate.years_experience >= job.min_years_experience:
    score += 0.15
else:
    score += 0.15 * (candidate.years_experience / job.min_years_experience)

if candidate.location matches job.location (city-level):
    score += 0.05

if job.work_mode == "Remote":
    score += 0.05

clamp score to [0, 1]
reasons[] = human-readable strings for each clause that fired
```

Top-K / Top-N is just `ORDER BY score DESC LIMIT k`.

---

## Suggested Django implementation notes

- Use **Django REST Framework** + **SimpleJWT** for the JWT auth flow.
- Use **PostgreSQL** with the `pg_trgm` extension for keyword search on jobs.
- Use a `ManyToManyField` to a `Skill` model so you can index/filter quickly.
- Store resumes in S3 (or `MEDIA_ROOT` for local dev) and return signed URLs.
- Enable CORS for the frontend origin via `django-cors-headers`.
- All write endpoints should enforce role via DRF permission classes
  (`IsCandidate`, `IsEmployerOwner`).
