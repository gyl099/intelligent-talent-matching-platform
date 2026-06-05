import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, auth, type JobPosting } from "@/lib/api";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetail,
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [err, setErr] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const user = auth.getUser();

  useEffect(() => {
    api.getJob(jobId).then(setJob).catch((e) => setErr((e as Error).message));
  }, [jobId]);

  const apply = async () => {
    setApplying(true);
    setApplyMsg("");
    try {
      await api.applyToJob(jobId);
      setApplyMsg("Application sent successfully!");
    } catch (e) {
      setApplyMsg((e as Error).message);
    } finally {
      setApplying(false);
    }
  };

  if (err) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container-page py-20 text-center max-w-xl">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="text-sm font-semibold text-destructive uppercase tracking-wider">Error Loading Job</p>
            <p className="text-muted-foreground mt-2">{err}</p>
          </div>
          <Link to="/jobs" className="btn-ghost mt-6 inline-flex">
            ← Back to job board
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container-page py-32 flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading job specifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <div className="container-page py-10 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <Link 
          to="/jobs" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> All available listings
        </Link>

        {/* Layout Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] items-start">
          
          {/* Main Job Content Area */}
          <article className="space-y-8 rounded-2xl border border-border bg-card/40 p-6 md:p-8 backdrop-blur-sm">
            <div>
              {/* Context Tagline Row */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                <span className="text-foreground font-bold">{job.company}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span className="text-[var(--color-ink)] bg-muted px-2 py-0.5 rounded text-xs font-medium normal-case">
                  {job.work_mode}
                </span>
              </div>
              
              {/* Main Title */}
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-foreground">
                {job.title}
              </h1>

              {/* Skills Tags Strip */}
              <div className="mt-6 flex flex-wrap gap-2">
                {job.required_skills.map((s) => (
                  <span 
                    key={s} 
                    className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground shadow-sm transition hover:border-foreground/30"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Structured Content Block */}
            <div className="space-y-6">
              <section>
                <h2 className="font-display text-2xl font-bold tracking-tight mb-3">About the role</h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground/90 font-normal">
                  {job.description}
                </p>
              </section>

              <hr className="border-border/60" />

              <section>
                <h2 className="font-display text-2xl font-bold tracking-tight mb-4">Core Benchmarks & Requirements</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 p-4">
                    <div className="mt-0.5 text-lg">🎓</div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Education</h4>
                      <p className="text-sm font-medium mt-0.5">{job.required_education} Degree or equivalent background</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 p-4">
                    <div className="mt-0.5 text-lg">💼</div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience</h4>
                      <p className="text-sm font-medium mt-0.5">{job.min_years_experience}+ Professional Years Required</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 p-4">
                    <div className="mt-0.5 text-lg">📍</div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work Environment</h4>
                      <p className="text-sm font-medium mt-0.5">{job.work_mode} Deployment ({job.location})</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/60 p-4">
                    <div className="mt-0.5 text-lg">🛠️</div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Framework</h4>
                      <p className="text-sm font-medium mt-0.5 truncate max-w-[200px]" title={job.required_skills.join(", ")}>
                        {job.required_skills[0]} & {job.required_skills.length - 1} other skill systems
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </article>

          {/* Sidebar Component Card */}
          <aside className="card-surface h-fit lg:sticky lg:top-24 border border-border shadow-md rounded-2xl bg-card p-6 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Target Compensation
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground flex items-baseline gap-1">
                {job.salary_min ? `$${job.salary_min.toLocaleString()}` : "—"}
                {job.salary_max ? ` – $${job.salary_max.toLocaleString()}` : ""}
                <span className="text-sm font-medium text-muted-foreground">/ mo</span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              {user?.role === "candidate" ? (
                <div className="space-y-3">
                  <button 
                    onClick={apply} 
                    disabled={applying || applyMsg === "Application sent successfully!"} 
                    className="btn-lime w-full font-semibold justify-center py-2.5 transition active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {applying ? "Processing Application..." : applyMsg === "Application sent successfully!" ? "✓ Applied" : "Submit Application →"}
                  </button>
                  {applyMsg && (
                    <p className={`text-center text-xs font-medium p-2.5 rounded-lg border ${
                      applyMsg.includes("successfully") 
                        ? "bg-[var(--color-lime)]/10 border-[var(--color-lime)]/30 text-foreground" 
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}>
                      {applyMsg}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-muted/60 border border-border/40 p-4 text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You must be registered as a candidate user to apply directly to this pipeline.
                  </p>
                  <Link 
                    to="/login" 
                    className="mt-3 inline-flex text-xs font-bold underline hover:text-[var(--color-ink)] transition-colors"
                  >
                    Sign in to your account
                  </Link>
                </div>
              )}
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}