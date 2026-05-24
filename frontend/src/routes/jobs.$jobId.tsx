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
      setApplyMsg("Application sent.");
    } catch (e) {
      setApplyMsg((e as Error).message);
    } finally {
      setApplying(false);
    }
  };

  if (err) {
    return (
      <div>
        <SiteHeader />
        <div className="container-page py-20">
          <p className="text-destructive">{err}</p>
          <Link to="/jobs" className="btn-ghost mt-4">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }
  if (!job) {
    return (
      <div>
        <SiteHeader />
        <div className="container-page py-20 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
          ← All jobs
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[1fr_320px]">
          <article>
            <div className="text-sm text-muted-foreground">
              {job.company} · {job.location} · {job.work_mode}
            </div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{job.title}</h1>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {job.required_skills.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>

            <div className="prose prose-neutral mt-8 max-w-none">
              <h2 className="font-display text-2xl">About the role</h2>
              <p className="whitespace-pre-line text-foreground/90">{job.description}</p>

              <h2 className="font-display text-2xl">Requirements</h2>
              <ul>
                <li>Education: {job.required_education} or higher</li>
                <li>Experience: {job.min_years_experience}+ years</li>
                <li>Skills: {job.required_skills.join(", ")}</li>
                <li>Work mode: {job.work_mode}</li>
              </ul>
            </div>
          </article>

          <aside className="card-surface h-fit md:sticky md:top-24">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Compensation
            </div>
            <div className="mt-1 font-display text-2xl">
              {job.salary_min ? `$${job.salary_min.toLocaleString()}` : "—"}
              {job.salary_max ? ` – $${job.salary_max.toLocaleString()}` : ""}
              <span className="ml-1 text-sm text-muted-foreground">/ mo</span>
            </div>
            {user?.role === "candidate" ? (
              <>
                <button onClick={apply} disabled={applying || applyMsg === "Application sent."} className="btn-lime mt-5 w-full">
                  {applying ? "Applying..." : applyMsg === "Application sent." ? "Applied" : "Apply now"}
                </button>
                {applyMsg && <p className="mt-3 text-xs text-muted-foreground">{applyMsg}</p>}
              </>
            ) : (
              <p className="mt-5 text-xs text-muted-foreground">Sign in as a candidate to apply.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
