import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Matchwork — Intelligent job matching for candidates and employers" },
      {
        name: "description",
        content:
          "Matchwork is an intelligent matching platform connecting candidates and employers. Profiles, jobs, and rule-based Top-K recommendations in one place.",
      },
      { property: "og:title", content: "Matchwork — Intelligent job matching" },
      { property: "og:description", content: "Find the right job, or the right hire. Matched by skills, education, and experience." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container-page grid gap-12 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <div className="chip mb-6">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
              Rule-based Top-K & Top-N matching
            </div>
            <h1 className="font-display text-5xl leading-[0.95] text-foreground md:text-7xl">
              Hiring,
              <br />
              <span className="relative inline-block">
                actually matched.
                <span className="absolute inset-x-0 bottom-1 -z-10 h-4 bg-[var(--color-lime)] md:h-5" />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Matchwork ranks jobs to candidates and candidates to jobs by skills,
              education, and experience — not keywords and luck. Built for two
              user groups, one workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" search={{ role: "candidate" } as never} className="btn-lime">
                I'm a candidate →
              </Link>
              <Link to="/signup" search={{ role: "employer" } as never} className="btn-primary">
                I'm hiring
              </Link>
              <Link to="/jobs" className="btn-ghost">
                Browse jobs
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="card-surface relative z-10 rotate-2">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Top match for Aarav
              </div>
              <h3 className="mt-2 font-display text-xl">Senior Full-Stack Engineer</h3>
              <p className="text-sm text-muted-foreground">Northwind Labs · Singapore</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["React", "TypeScript", "Django", "PostgreSQL"].map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="chip-lime">94% match</span>
                <span className="font-mono text-xs text-muted-foreground">$9K–13K</span>
              </div>
            </div>
            <div className="card-surface absolute -bottom-6 -left-4 w-[88%] -rotate-3 opacity-90">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Top candidate for Northwind
              </div>
              <h3 className="mt-2 font-display text-lg">Priya Nair · 4y</h3>
              <p className="text-sm text-muted-foreground">React · TypeScript · Design Systems</p>
              <div className="mt-3">
                <span className="chip-lime">91% fit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="border-b border-border">
        <div className="container-page py-20">
          <h2 className="max-w-2xl font-display text-4xl text-foreground">
            One platform. Two sides. Zero noise.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="card-surface">
              <div className="chip mb-4">For candidates</div>
              <h3 className="font-display text-2xl">Build a profile that gets matched, not lost.</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {[
                  "Upload your resume or fill in details manually",
                  "Search and browse jobs by keyword, mode, and location",
                  "Receive Top-K recommendations ranked by fit",
                  "See why each job was suggested — no black boxes",
                ].map((l) => (
                  <li key={l} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" />
                    {l}
                  </li>
                ))}
              </ul>
              <Link to="/signup" search={{ role: "candidate" } as never} className="btn-primary mt-6">
                Create candidate account
              </Link>
            </div>

            <div className="card-surface">
              <div className="chip mb-4">For employers</div>
              <h3 className="font-display text-2xl">Stop reading 400 resumes. Start with the right 10.</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {[
                  "Post detailed roles with required skills and experience",
                  "Search and filter candidates by skill, education, experience",
                  "Get Top-N candidate recommendations per posting",
                  "Contact directly — no recruiter middleman",
                ].map((l) => (
                  <li key={l} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" />
                    {l}
                  </li>
                ))}
              </ul>
              <Link to="/signup" search={{ role: "employer" } as never} className="btn-primary mt-6">
                Create employer account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="container-page py-10 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Matchwork</span>
          <span className="font-mono text-xs">React + Tailwind · Django REST · PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
