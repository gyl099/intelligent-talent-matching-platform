import { createFileRoute } from "@tanstack/react-router";
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

function JobsPage() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<WorkMode | "All">("All");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .listJobs({
        q: q || undefined,
        work_mode: mode === "All" ? undefined : mode,
        location: location || undefined,
      })
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [q, mode, location]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <h1 className="font-display text-4xl md:text-5xl">Open roles</h1>
        <p className="mt-2 text-muted-foreground">
          Search across all postings. {jobs.length} {jobs.length === 1 ? "result" : "results"}.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            placeholder="Search by title, company, skill…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="field"
          />
          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field md:w-56"
          />
          <div className="flex rounded-lg border border-border bg-card p-1">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  mode === m
                    ? "bg-[var(--color-ink)] text-[var(--color-primary-foreground)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-muted-foreground">No matches. Try a different search.</p>
          ) : (
            jobs.map((j) => <JobCard key={j.id} job={j} />)
          )}
        </div>
      </div>
    </div>
  );
}
