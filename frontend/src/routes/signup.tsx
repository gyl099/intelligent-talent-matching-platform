import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, auth, type Role } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>) => ({
    role: (s.role as Role) || "candidate",
  }),
  head: () => ({ meta: [{ title: "Create account — Matchwork" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { role: initialRole } = Route.useSearch();
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.signup({ email, password, full_name: fullName, role });
      auth.setSession(token, user);
      router.navigate({
        to: role === "candidate" ? "/candidate/profile" : "/employer/dashboard",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-4xl md:text-5xl">Create your account</h1>
          <p className="mt-3 text-muted-foreground">It takes about 30 seconds.</p>

          <div className="mt-8 grid grid-cols-2 gap-2 rounded-full border border-border bg-card p-1">
            {(["candidate", "employer"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                  role === r
                    ? "bg-[var(--color-ink)] text-[var(--color-primary-foreground)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                I'm a {r}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label">{role === "employer" ? "Company name" : "Full name"}</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="field" />
            </div>
            <div>
              <label className="label">Work email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button disabled={loading} className="btn-lime w-full">
              {loading ? "Creating account…" : "Create account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
