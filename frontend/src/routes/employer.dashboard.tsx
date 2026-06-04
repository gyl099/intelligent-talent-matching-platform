import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { CandidateCard } from "@/components/candidate-card";
import { api, auth, type CandidateMatch, type JobApplication, type JobPosting, type WorkMode } from "@/lib/api";

export const Route = createFileRoute("/employer/dashboard")({
  beforeLoad: () => {
    const u = auth.getUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "employer") throw redirect({ to: "/candidate/dashboard" });
  },
  head: () => ({ meta: [{ title: "My postings — Matchwork" }] }),
  component: EmployerDashboard,
});

const EDU = ["Diploma", "Bachelor", "Master", "PhD"];
const MODES: WorkMode[] = ["Remote", "Hybrid", "On-site"];

function EmployerDashboard() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.myJobs().then((js) => {
      setJobs(js);
      if (js[0]) setSelectedId(js[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingMatches(true);
    Promise.all([api.recommendedCandidates(selectedId, 10), api.jobApplications(selectedId)])
      .then(([candidateMatches, jobApplications]) => {
        setMatches(candidateMatches);
        setApplications(jobApplications);
      })
      .finally(() => setLoadingMatches(false));
  }, [selectedId, refreshKey]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Employer dashboard</p>
            <h1 className="mt-1 font-display text-4xl md:text-5xl">Your postings</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/employer/candidates" className="btn-ghost">
              Search candidates
            </Link>
            <Link to="/employer/jobs/new" className="btn-lime">
              + New posting
            </Link>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="card-surface mt-10 text-center">
            <h2 className="font-display text-2xl">No postings yet</h2>
            <p className="mt-2 text-muted-foreground">Create your first job to start matching candidates.</p>
            <Link to="/employer/jobs/new" className="btn-primary mt-5 inline-flex">
              Create a posting
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside className="space-y-2">
              {jobs.map((j) => (
                <article
                  key={j.id}
                  className={`rounded-xl border p-4 transition ${
                    selectedId === j.id
                      ? "border-[var(--color-ink)] bg-card"
                      : "border-border bg-card/60 hover:border-foreground/40"
                  }`}
                >
                  <button type="button" onClick={() => setSelectedId(j.id)} className="w-full text-left">
                    <p className="font-display text-base">{j.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {j.work_mode} · {j.location}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {j.required_skills.length} skills · {j.min_years_experience}+ yrs
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(j.id);
                      setEditingJob(j);
                    }}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-[var(--color-ink)] hover:bg-accent"
                  >
                    Manage
                  </button>
                </article>
              ))}
            </aside>

            <section>
              <h2 className="font-display text-2xl">Applicants</h2>
              <p className="text-sm text-muted-foreground">
                Candidates who applied to this posting.
              </p>
              <div className="mt-5 grid gap-4">
                {loadingMatches ? (
                  <p className="text-muted-foreground">Loading applicants...</p>
                ) : applications.length === 0 ? (
                  <p className="text-muted-foreground">No applications yet.</p>
                ) : (
                  applications.map((a) => (
                    <CandidateCard key={a.id} candidate={a.candidate} />
                  ))
                )}
              </div>

              <h2 className="mt-10 font-display text-2xl">Top-10 candidates</h2>
              <p className="text-sm text-muted-foreground">
                Ranked by skills overlap, education, and experience.
              </p>
              <div className="mt-5 grid gap-4">
                {loadingMatches ? (
                  <p className="text-muted-foreground">Computing matches…</p>
                ) : matches.length === 0 ? (
                  <p className="text-muted-foreground">No candidates yet.</p>
                ) : (
                  matches.map((m) => (
                    <CandidateCard
                      key={m.candidate.id}
                      candidate={m.candidate}
                      score={m.score}
                      reasons={m.reasons}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
      {editingJob && (
        <ManageJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSaved={(updatedJob) => {
            setJobs((current) => current.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
            setSelectedId(updatedJob.id);
            setRefreshKey((key) => key + 1);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}

function ManageJobModal({
  job,
  onClose,
  onSaved,
}: {
  job: JobPosting;
  onClose: () => void;
  onSaved: (job: JobPosting) => void;
}) {
  const [title, setTitle] = useState(job.title);
  const [company, setCompany] = useState(job.company);
  const [description, setDescription] = useState(job.description);
  const [education, setEducation] = useState(job.required_education);
  const [skillsText, setSkillsText] = useState(job.required_skills.join(", "));
  const [minYears, setMinYears] = useState(job.min_years_experience);
  const [mode, setMode] = useState<WorkMode>(job.work_mode);
  const [location, setLocation] = useState(job.location);
  const [salaryMin, setSalaryMin] = useState<number | "">(job.salary_min ?? "");
  const [salaryMax, setSalaryMax] = useState<number | "">(job.salary_max ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updatedJob = await api.updateJob(job.id, {
        title,
        company,
        description,
        required_education: education,
        required_skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        min_years_experience: minYears,
        work_mode: mode,
        location,
        salary_min: salaryMin === "" ? null : Number(salaryMin),
        salary_max: salaryMax === "" ? null : Number(salaryMax),
      });
      onSaved(updatedJob);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/40 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
          <div>
            <p className="text-sm text-muted-foreground">Your postings</p>
            <h2 className="font-display text-2xl">Manage job posting</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg leading-none transition hover:bg-accent"
            aria-label="Close manage job modal"
          >
            x
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Job title</label>
              <input required className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Company</label>
              <input required className="field" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Job description</label>
            <textarea required rows={5} className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Required education</label>
              <select className="field" value={education} onChange={(e) => setEducation(e.target.value)}>
                {EDU.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Min years experience</label>
              <input type="number" min={0} className="field" value={minYears} onChange={(e) => setMinYears(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Work mode</label>
              <select className="field" value={mode} onChange={(e) => setMode(e.target.value as WorkMode)}>
                {MODES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Required skills</label>
            <input
              required
              className="field"
              placeholder="React, TypeScript, Django"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Location</label>
              <input required className="field" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="label">Salary min</label>
              <input type="number" className="field" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Salary max</label>
              <input type="number" className="field" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button disabled={saving} className="btn-lime">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
