import type { CandidateProfile } from "@/lib/api";

export function CandidateCard({
  candidate,
  score,
  reasons,
}: {
  candidate: CandidateProfile;
  score?: number;
  reasons?: string[];
}) {
  const initials = candidate.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="card-surface">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-sm font-semibold text-[var(--color-primary-foreground)]">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg text-foreground">{candidate.full_name}</h3>
            <p className="truncate text-sm text-muted-foreground">
              {candidate.headline || `${candidate.education} · ${candidate.years_experience}y experience`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {candidate.location || "Location unspecified"}
            </p>
          </div>
        </div>
        {score != null && (
          <div className="chip-lime shrink-0">{Math.round(score * 100)}% fit</div>
        )}
      </div>

      {candidate.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{candidate.bio}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="chip">{candidate.education}</span>
        <span className="chip">{candidate.years_experience}y exp</span>
        {candidate.major && <span className="chip">{candidate.major}</span>}
        {candidate.skills.slice(0, 6).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
        {candidate.skills.length > 6 && (
          <span className="chip">+{candidate.skills.length - 6}</span>
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

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`mailto:${candidate.email}`} className="btn-primary">
          Contact
        </a>
        {candidate.resume_filename && candidate.resume_url && (
          <a
            href={candidate.resume_url}
            download={candidate.resume_filename}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost inline-flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3M3 7V4a1 1 0 011-1h16a1 1 0 011 1v3" />
            </svg>
            Download Resume
          </a>
        )}
        {candidate.resume_filename && !candidate.resume_url && (
          <span className="btn-ghost cursor-default opacity-50 inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {candidate.resume_filename}
          </span>
        )}
      </div>
    </div>
  );
}
