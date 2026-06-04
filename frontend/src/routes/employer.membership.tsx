import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, auth } from "@/lib/api";

export const Route = createFileRoute("/employer/membership")({
  beforeLoad: () => {
    const u = auth.getUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "employer") throw redirect({ to: "/candidate/membership" });
  },
  head: () => ({ meta: [{ title: "Upgrade membership — Matchwork" }] }),
  component: EmployerMembershipPage,
});

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function EmployerMembershipPage() {
  const router = useRouter();
  const currentUser = auth.getUser();
  const alreadyMember = currentUser?.is_member ?? false;

  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length !== 16) { setError("Card number must be 16 digits."); return; }
    if (expiry.replace(/\D/g, "").length !== 4) { setError("Enter a valid expiry (MM/YY)."); return; }
    if (cvv.length < 3) { setError("CVV must be 3 digits."); return; }

    setLoading(true);
    try {
      const { user: verifiedUser, token } = await api.login({ email, password });
      if (verifiedUser.role !== "employer") {
        setError("This account is not a company account.");
        return;
      }
      auth.setSession(token, verifiedUser);
      const { user: updatedUser } = await api.activateMembership();
      auth.setSession(token, updatedUser);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="container-page flex flex-col items-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-lime)]">
            <svg className="h-8 w-8 text-[var(--color-lime-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 font-display text-4xl">Company upgraded!</h1>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Your account has been upgraded. You can now post up to <strong>3 job listings</strong> and see <strong>unlimited candidate recommendations</strong>.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => router.navigate({ to: "/employer/dashboard" })}
              className="btn-lime"
            >
              Go to dashboard →
            </button>
            <Link to="/employer/jobs/new" className="btn-ghost">Post a job</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-2xl">

          {/* Hero / pricing */}
          <div className="text-center">
            <span className="chip-lime">Company Plan</span>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">
              Hire without limits
            </h1>
            <p className="mt-3 text-muted-foreground">
              Free accounts allow 1 active job posting. Members can post up to <strong>3 listings</strong> and see <strong>all matched candidates</strong>.
            </p>
          </div>

          {/* Comparison */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="card-surface space-y-3 text-sm text-muted-foreground">
              <p className="font-display text-base text-foreground">Free</p>
              <p className="flex items-center gap-2">
                <span className="text-destructive font-bold">×</span>
                1 job posting
              </p>
              <p className="flex items-center gap-2">
                <span className="text-destructive font-bold">×</span>
                Top 10 candidates only
              </p>
            </div>
            <div className="rounded-2xl border-2 border-[var(--color-lime)] bg-[var(--color-lime)]/10 p-6 space-y-3 text-sm">
              <p className="font-display text-base text-foreground">Member</p>
              <p className="flex items-center gap-2">
                <span className="text-[var(--color-lime-foreground)] font-bold">✓</span>
                Up to 3 job postings
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[var(--color-lime-foreground)] font-bold">✓</span>
                Unlimited candidate matches
              </p>
            </div>
          </div>

          {/* Price card */}
          <div className="mt-6 rounded-2xl border-2 border-[var(--color-ink)] bg-card p-8">
            <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Company plan</p>
                <p className="mt-1 font-display text-5xl">
                  $5.99
                  <span className="ml-1 text-xl font-normal text-muted-foreground">/month</span>
                </p>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground text-right">
                <p className="flex items-center justify-end gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
                  Up to 3 active listings
                </p>
                <p className="flex items-center justify-end gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
                  Unlimited candidate recommendations
                </p>
                <p className="flex items-center justify-end gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
                  Cancel anytime
                </p>
              </div>
            </div>

            {alreadyMember ? (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">Your company already has an active membership.</p>
                <Link to="/employer/dashboard" className="btn-lime mt-4 inline-flex">
                  Go to dashboard →
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Confirm your company account
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">Company email</label>
                    <input
                      type="email"
                      required
                      className="field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      type="password"
                      required
                      className="field"
                      placeholder="Your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
                    Payment details
                  </p>
                  <div>
                    <label className="label">Card number</label>
                    <input
                      required
                      className="field font-mono tracking-widest"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Expiry (MM/YY)</label>
                      <input
                        required
                        className="field font-mono"
                        placeholder="08/27"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="label">CVV</label>
                      <input
                        required
                        className="field font-mono"
                        placeholder="123"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button disabled={loading} className="btn-lime w-full">
                  {loading ? "Processing…" : "Subscribe for $5.99/month →"}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  You can cancel anytime from your dashboard. No hidden fees.
                </p>
              </form>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/employer/dashboard" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
