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
  const [memberLoading, setMemberLoading] = useState(false);
  const [isMember, setIsMember] = useState<boolean>(auth.getUser()?.is_member ?? false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  function loadMatches(member: boolean) {
    setLoading(true);
    Promise.all([api.getMyProfile(), api.recommendedJobs(member ? undefined : 10)])
      .then(([p, m]) => { setProfile(p); setMatches(m); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadMatches(isMember); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCancelMembership() {
    setMemberLoading(true);
    try {
      await api.cancelMembership();
      setIsMember(false);
      setConfirmCancel(false);
      loadMatches(false);
    } catch {
      setConfirmCancel(false);
    } finally {
      setMemberLoading(false);
    }
  }

  const profileIncomplete = profile && (profile.skills.length === 0 || !profile.education);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || "candidate"}</p>
            <h1 className="mt-1 font-display text-4xl md:text-5xl">
              {isMember ? "All your matches" : "Your Top-10 matches"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {isMember ? (
              confirmCancel ? (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                  <span className="text-destructive font-medium">Cancel membership?</span>
                  <button
                    onClick={handleCancelMembership}
                    disabled={memberLoading}
                    className="rounded-md bg-destructive px-3 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {memberLoading ? "…" : "Yes, cancel"}
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium hover:bg-accent"
                  >
                    Keep it
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Cancel membership
                </button>
              )
            ) : (
              <Link to="/candidate/membership" className="btn-lime">
                Upgrade to member →
              </Link>
            )}
            <Link to="/candidate/profile" className="btn-ghost">
              Edit profile
            </Link>
          </div>
        </div>

        {isMember ? (
          <div className="mt-4 rounded-xl border border-[var(--color-lime)] bg-[var(--color-lime)]/30 p-3 text-sm">
            <strong>Member:</strong> Showing all matched jobs — no limit.
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
            Non-member: showing top 10 matches only.{" "}
            <Link to="/candidate/membership" className="underline text-foreground">
              Upgrade to see all →
            </Link>
          </div>
        )}

        {profileIncomplete && (
          <div className="mt-4 rounded-xl border border-[var(--color-lime)] bg-[var(--color-lime)]/30 p-4 text-sm">
            <strong>Boost your matches.</strong> Add skills and education to your profile to get more relevant recommendations.{" "}
            <Link to="/candidate/profile" className="underline">Complete profile →</Link>
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
