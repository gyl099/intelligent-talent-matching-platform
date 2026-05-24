import { Link } from "@tanstack/react-router";
import type { JobPosting } from "@/lib/api";

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (d <= 0) return "Today";
  if (d === 1) return "1d ago";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  return `${m}mo ago`;
}

export function JobCard({
  job,
  score,
  reasons,
}: {
  job: JobPosting;
  score?: number;
  reasons?: string[];
}) {
  return (
    <Link
      to="/jobs/$jobId"
      params={{ jobId: job.id }}
      className="card-surface group block transition hover:border-foreground/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{job.company}</span>
            <span>·</span>
            <span>{job.location}</span>
            <span>·</span>
            <span>{timeAgo(job.posted_at)}</span>
          </div>
          <h3 className="mt-1 font-display text-xl text-foreground group-hover:underline">
            {job.title}
          </h3>
        </div>
        {score != null && (
          <div className="chip-lime shrink-0">{Math.round(score * 100)}% match</div>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="chip">{job.work_mode}</span>
        <span className="chip">{job.required_education}+</span>
        <span className="chip">{job.min_years_experience}+ yrs</span>
        {job.required_skills.slice(0, 4).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
        {job.required_skills.length > 4 && (
          <span className="chip">+{job.required_skills.length - 4}</span>
        )}
      </div>

      {reasons && reasons.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex items-start gap-1.5">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--color-lime)]" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
