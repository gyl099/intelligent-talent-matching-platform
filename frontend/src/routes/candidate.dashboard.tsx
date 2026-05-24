import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { JobCard } from "@/components/job-card";
import { api, auth, type CandidateProfile, type JobMatch } from "@/lib/api";

export const Route = createFileRoute("/candidate/dashboard")({
  beforeLoad: () => {
    const u = auth.getUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "candidate") throw redirect({ to: "/employer/dashboard" });
  },
  head: () => ({ meta: [{ title: "Recommended for you — Matchwork" }] }),
  component: CandidateDashboard,
});

function CandidateDashboard() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyProfile(), api.recommendedJobs(10)])
      .then(([p, m]) => {
        setProfile(p);
        setMatches(m);
      })
      .finally(() => setLoading(false));
  }, []);

  const profileIncomplete = profile && (profile.skills.length === 0 || !profile.education);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || "candidate"}</p>
            <h1 className="mt-1 font-display text-4xl md:text-5xl">Your Top-10 matches</h1>
          </div>
          <Link to="/candidate/profile" className="btn-ghost">
            Edit profile
          </Link>
        </div>

        {profileIncomplete && (
          <div className="mt-6 rounded-xl border border-[var(--color-lime)] bg-[var(--color-lime)]/30 p-4 text-sm">
            <strong>Boost your matches.</strong> Add skills and education to your profile to get more
            relevant recommendations.{" "}
            <Link to="/candidate/profile" className="underline">
              Complete profile →
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="text-muted-foreground">Computing matches…</p>
          ) : matches.length === 0 ? (
            <p className="text-muted-foreground">No matches yet. Try adding skills to your profile.</p>
          ) : (
            matches.map((m) => <JobCard key={m.job.id} job={m.job} score={m.score} reasons={m.reasons} />)
          )}
        </div>
      </div>
    </div>
  );
}
