import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, isMockMode } from "@/lib/api";
import type { User } from "@/lib/api";

export function SiteHeader() {
  const router = useRouter();
  const state = useRouterState();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(auth.getUser());
  }, [state.location.pathname]);

  const logout = () => {
    auth.clear();
    setUser(null);
    router.navigate({ to: "/" });
  };

  const homePath = user?.role === "candidate"
    ? "/candidate/dashboard"
    : user?.role === "employer"
      ? "/employer/dashboard"
      : "/";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to={homePath} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-ink)] text-[var(--color-primary-foreground)]">
            <span className="font-display text-sm font-bold">M</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Matchwork</span>
          {isMockMode && (
            <span className="ml-2 hidden rounded-full bg-[var(--color-lime)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-lime-foreground)] md:inline">
              demo
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {user?.role !== "employer" && (
            <Link to="/jobs" className="text-muted-foreground transition hover:text-foreground">
              Browse jobs
            </Link>
          )}
          {user?.role === "candidate" && (
            <>
              <Link to="/candidate/dashboard" className="text-muted-foreground transition hover:text-foreground">
                Recommended
              </Link>
              <Link to="/candidate/profile" className="text-muted-foreground transition hover:text-foreground">
                Profile
              </Link>
            </>
          )}
          {user?.role === "employer" && (
            <>
              <Link to="/employer/dashboard" className="text-muted-foreground transition hover:text-foreground">
                My postings
              </Link>
              <Link to="/employer/candidates" className="text-muted-foreground transition hover:text-foreground">
                Find candidates
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.full_name}
              </span>
              <button onClick={logout} className="btn-ghost">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link to="/signup" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
