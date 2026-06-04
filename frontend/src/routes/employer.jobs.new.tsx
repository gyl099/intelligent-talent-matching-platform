import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, auth, type JobPosting, type WorkMode } from "@/lib/api";

export const Route = createFileRoute("/employer/jobs/new")({
  beforeLoad: () => {
    const u = auth.getUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "employer") throw redirect({ to: "/candidate/dashboard" });
  },
  head: () => ({ meta: [{ title: "New posting — Matchwork" }] }),
  component: NewJobPage,
});

const EDU = ["Diploma", "Bachelor", "Master", "PhD"];
const MODES: WorkMode[] = ["Remote", "Hybrid", "On-site"];

function NewJobPage() {
  const router = useRouter();
  const user = auth.getUser();
  // Read from state so a fresh mount always reflects the latest localStorage value.
  const [isMember] = useState<boolean>(() => auth.getUser()?.is_member ?? false);
  const jobLimit = isMember ? 3 : 1;

  const [myJobs, setMyJobs] = useState<JobPosting[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.full_name ?? "");
  const [description, setDescription] = useState("");
  const [education, setEducation] = useState("Bachelor");
  const [skillsText, setSkillsText] = useState("");
  const [minYears, setMinYears] = useState(0);
  const [mode, setMode] = useState<WorkMode>("Hybrid");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState<number | "">("");
  const [salaryMax, setSalaryMax] = useState<number | "">("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.myJobs().then((js) => setMyJobs(js)).finally(() => setLoadingJobs(false));
  }, []);

  const atLimit = !loadingJobs && myJobs.length >= jobLimit;
  const slotsLeft = Math.max(0, jobLimit - myJobs.length);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const job = await api.createJob({
        title,
        company,
        description,
        required_education: education,
        required_skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
        min_years_experience: minYears,
        work_mode: mode,
        location,
        salary_min: salaryMin === "" ? undefined : Number(salaryMin),
        salary_max: salaryMax === "" ? undefined : Number(salaryMax),
      });
      router.navigate({ to: "/jobs/$jobId", params: { jobId: job.id } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl">New job posting</h1>
            <p className="mt-2 text-muted-foreground">Be specific. The more detail, the better the candidate ranking.</p>
          </div>
          {!loadingJobs && (
            <p className="text-sm text-muted-foreground">
              {myJobs.length}/{jobLimit} posting{jobLimit > 1 ? "s" : ""} used
              {isMember ? "" : " — non-member"}
            </p>
          )}
        </div>

        {atLimit ? (
          <div className="mt-10 card-surface text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-[var(--color-lime)]/30">
              <span className="font-display text-2xl">🔒</span>
            </div>
            <h2 className="font-display text-2xl">Posting limit reached</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {isMember
                ? "Member accounts can post up to 3 jobs. Remove an existing posting to add a new one."
                : "Free accounts can only post 1 job. Upgrade to a member account to post up to 3 listings."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              {!isMember && (
                <Link to="/employer/membership" className="btn-lime">
                  Upgrade to member →
                </Link>
              )}
              <Link to="/employer/dashboard" className="btn-ghost">
                View my postings
              </Link>
            </div>
          </div>
        ) : (
          <>
            {!loadingJobs && (
              <div className={`mt-6 rounded-xl border p-3 text-sm ${
                slotsLeft === 1
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-[var(--color-lime)] bg-[var(--color-lime)]/20 text-[var(--color-lime-foreground)]"
              }`}>
                {slotsLeft === 1 ? (
                  <>
                    Last posting slot available.{" "}
                    {isMember ? "Members can post up to 3 jobs." : (
                      <><Link to="/employer/membership" className="underline font-medium">Upgrade to member</Link> for up to 3 postings.</>
                    )}
                  </>
                ) : (
                  <>
                    {slotsLeft} posting slot{slotsLeft > 1 ? "s" : ""} remaining.
                    {!isMember && (
                      <> <Link to="/employer/membership" className="underline font-medium">Upgrade for more slots →</Link></>
                    )}
                  </>
                )}
              </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-6">
              <section className="card-surface space-y-4">
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
                  <textarea required rows={6} className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </section>

              <section className="card-surface space-y-4">
                <h2 className="font-display text-lg">Requirements</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="label">Required education</label>
                    <select className="field" value={education} onChange={(e) => setEducation(e.target.value)}>
                      {EDU.map((e) => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Min years experience</label>
                    <input type="number" min={0} className="field" value={minYears} onChange={(e) => setMinYears(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="label">Work mode</label>
                    <select className="field" value={mode} onChange={(e) => setMode(e.target.value as WorkMode)}>
                      {MODES.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Required skills (comma-separated)</label>
                  <input
                    required
                    className="field"
                    placeholder="React, TypeScript, Django, PostgreSQL"
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
                    <label className="label">Salary min (monthly)</label>
                    <input type="number" className="field" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="label">Salary max (monthly)</label>
                    <input type="number" className="field" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))} />
                  </div>
                </div>
              </section>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
                <button disabled={saving} className="btn-lime">
                  {saving ? "Publishing…" : "Publish posting"}
                </button>
                <button type="button" onClick={() => router.navigate({ to: "/employer/dashboard" })} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
