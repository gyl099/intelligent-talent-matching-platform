import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, auth, isMockMode } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Matchwork" }] }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.login({ email, password });
      auth.setSession(token, user);
      router.navigate({ to: user.role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page grid items-center py-16 md:grid-cols-2 md:py-24">
        <div className="hidden pr-12 md:block">
          <h1 className="font-display text-5xl">Welcome back.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Pick up where you left off — your recommendations, applications, and saved
            candidates are waiting.
          </p>
        </div>

        <div className="card-surface mx-auto w-full max-w-md">
          <h2 className="font-display text-2xl">Sign in</h2>
          {isMockMode && (
            <p className="mt-2 text-xs text-muted-foreground">
              Demo accounts: <span className="font-mono">aarav.mehta@example.com</span> (candidate)
              or <span className="font-mono">hiring@northwind.io</span> (employer). Any password works.
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-foreground underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
