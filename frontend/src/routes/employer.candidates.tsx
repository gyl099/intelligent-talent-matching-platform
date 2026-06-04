import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { CandidateCard } from "@/components/candidate-card";
import { api, auth, type CandidateProfile } from "@/lib/api";

export const Route = createFileRoute("/employer/candidates")({
  beforeLoad: () => {
    const u = auth.getUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "employer") throw redirect({ to: "/candidate/dashboard" });
  },
  head: () => ({ meta: [{ title: "Find candidates — Matchwork" }] }),
  component: SearchCandidatesPage,
});

const EDU = ["", "Diploma", "Bachelor", "Master", "PhD"];

function SearchCandidatesPage() {
  const [q, setQ] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [education, setEducation] = useState("");
  const [minExp, setMinExp] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    api
      .searchCandidates({
        q: q || undefined,
        skills: skills.length ? skills : undefined,
        education: education || undefined,
        min_experience: minExp === "" ? undefined : Number(minExp),
        location: location || undefined,
      })
      .then(setResults)
      .finally(() => setLoading(false));
  }, [q, skillsText, education, minExp, location]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <h1 className="font-display text-4xl md:text-5xl">Find candidates</h1>
        <p className="mt-2 text-muted-foreground">
          Search and filter the talent pool. {results.length} {results.length === 1 ? "result" : "results"}.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="card-surface h-fit space-y-4 lg:sticky lg:top-24">
            <div>
              <label className="label">Search</label>
              <input className="field" placeholder="name, role, bio… (typos OK)" value={q} onChange={(e) => setQ(e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">Fuzzy search — handles typos.</p>
            </div>
            <div>
              <label className="label">Location</label>
              <input className="field" placeholder="e.g. Sydney" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="label">Required skills (comma)</label>
              <input className="field" placeholder="React, Django" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">All listed skills must match.</p>
            </div>
            <div>
              <label className="label">Education (min)</label>
              <select className="field" value={education} onChange={(e) => setEducation(e.target.value)}>
                {EDU.map((e) => (
                  <option key={e} value={e}>
                    {e || "Any"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Min years experience</label>
              <input type="number" min={0} className="field" value={minExp} onChange={(e) => setMinExp(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </aside>

          <section className="grid content-start gap-4">
            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : results.length === 0 ? (
              <p className="text-muted-foreground">No candidates match. Loosen the filters.</p>
            ) : (
              results.map((c) => <CandidateCard key={c.id} candidate={c} />)
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
