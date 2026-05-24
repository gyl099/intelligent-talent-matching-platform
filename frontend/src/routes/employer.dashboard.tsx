import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { CandidateCard } from "@/components/candidate-card";
import { api, auth, type CandidateMatch, type JobApplication, type JobPosting } from "@/lib/api";

export const Route = createFileRoute("/employer/dashboard")({
  beforeLoad: () => {
    const u = auth.getUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "employer") throw redirect({ to: "/candidate/dashboard" });
  },
  head: () => ({ meta: [{ title: "My postings — Matchwork" }] }),
  component: EmployerDashboard,
});

function EmployerDashboard() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

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
  }, [selectedId]);

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
                <button
                  key={j.id}
                  onClick={() => setSelectedId(j.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedId === j.id
                      ? "border-[var(--color-ink)] bg-card"
                      : "border-border bg-card/60 hover:border-foreground/40"
                  }`}
                >
                  <p className="font-display text-base">{j.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {j.work_mode} · {j.location}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {j.required_skills.length} skills · {j.min_years_experience}+ yrs
                  </p>
                </button>
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
    </div>
  );
}
