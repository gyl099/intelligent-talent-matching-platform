import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { JobCard } from "@/components/job-card";
import { api, type JobPosting, type WorkMode } from "@/lib/api";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Browse jobs — Matchwork" },
      { name: "description", content: "Search and filter open job postings across companies and roles." },
    ],
  }),
  component: JobsPage,
});

const MODES: (WorkMode | "All")[] = ["All", "Remote", "Hybrid", "On-site"];
const EDU = ["", "Diploma", "Bachelor", "Master", "PhD"];

function JobsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<WorkMode | "All">("All");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState<number | "">("");
  const [salaryMax, setSalaryMax] = useState<number | "">("");
  const [education, setEducation] = useState("");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .listJobs({
        q: q || undefined,
        work_mode: mode === "All" ? undefined : mode,
        location: location || undefined,
        salary_min: salaryMin === "" ? undefined : Number(salaryMin),
        salary_max: salaryMax === "" ? undefined : Number(salaryMax),
        required_education: education || undefined,
      })
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [q, mode, location, salaryMin, salaryMax, education]);

  if (pathname.replace(/\/$/, "") !== "/jobs") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <h1 className="font-display text-4xl md:text-5xl">Open roles</h1>
        <p className="mt-2 text-muted-foreground">
          Search across all postings. {jobs.length} {jobs.length === 1 ? "result" : "results"}.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="card-surface h-fit space-y-4 lg:sticky lg:top-24">
            <div>
              <label className="label">Search</label>
              <input
                className="field"
                placeholder="title, skill, company… (typos OK)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">Fuzzy search — handles typos.</p>
            </div>
            <div>
              <label className="label">Location</label>
              <input className="field" placeholder="e.g. Sydney" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="label">Work mode</label>
              <div className="flex flex-wrap gap-1">
                {MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      mode === m
                        ? "bg-[var(--color-ink)] text-[var(--color-primary-foreground)]"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Education (required)</label>
              <select className="field" value={education} onChange={(e) => setEducation(e.target.value)}>
                {EDU.map((e) => (
                  <option key={e} value={e}>{e || "Any"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Salary range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  className="field"
                  placeholder="Min"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <input
                  type="number"
                  min={0}
                  className="field"
                  placeholder="Max"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>
          </aside>

          <section className="grid content-start gap-4">
            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : jobs.length === 0 ? (
              <p className="text-muted-foreground">No matches. Try a different search.</p>
            ) : (
              jobs.map((j) => <JobCard key={j.id} job={j} />)
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
