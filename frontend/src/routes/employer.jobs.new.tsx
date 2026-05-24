import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, auth, type WorkMode } from "@/lib/api";

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
        required_skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
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
        <h1 className="font-display text-4xl md:text-5xl">New job posting</h1>
        <p className="mt-2 text-muted-foreground">Be specific. The more detail, the better the candidate ranking.</p>

        <form onSubmit={submit} className="mt-10 space-y-6">
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
      </div>
    </div>
  );
}
