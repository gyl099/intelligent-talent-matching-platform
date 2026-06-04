import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { api, auth, type CandidateProfile } from "@/lib/api";

export const Route = createFileRoute("/candidate/profile")({
  beforeLoad: () => {
    const u = auth.getUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "candidate") throw redirect({ to: "/employer/dashboard" });
  },
  head: () => ({ meta: [{ title: "Your profile — Matchwork" }] }),
  component: ProfilePage,
});

const EDUCATION_OPTIONS = ["Diploma", "Bachelor", "Master", "PhD"];

function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    api.getMyProfile().then(setProfile);
  }, []);

  if (!profile) {
    return (
      <div>
        <SiteHeader />
        <div className="container-page py-20 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const set = <K extends keyof CandidateProfile>(k: K, v: CandidateProfile[K]) =>
    setProfile({ ...profile, [k]: v });

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || profile.skills.includes(s)) return;
    set("skills", [...profile.skills, s]);
    setSkillInput("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await api.updateMyProfile(profile);
      setProfile(updated);
      setSaveMsg("Profile saved.");
    } catch (err) {
      setSaveMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so the same file can be re-selected after removal
    e.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") || file.type !== "application/pdf") {
      setUploadMsg("Only PDF files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadMsg("File must be under 10 MB.");
      return;
    }

    setUploading(true);
    setUploadMsg("");
    try {
      const res = await api.uploadResume(file);
      setProfile({ ...profile, resume_filename: res.resume_filename, resume_url: res.resume_url });
      setUploadMsg("Resume uploaded successfully.");
    } catch (err) {
      setUploadMsg((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const removeResume = () => {
    setProfile({ ...profile, resume_filename: "", resume_url: "" });
    setUploadMsg("");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-12">
        <h1 className="font-display text-4xl md:text-5xl">Your profile</h1>
        <p className="mt-2 text-muted-foreground">
          Better profiles get better matches. Add detail, save, and the recommendations update.
        </p>

        <form onSubmit={save} className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="card-surface">
              <h2 className="font-display text-xl">Basics</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Full name</label>
                  <input className="field" value={profile.full_name} onChange={(e) => set("full_name", e.target.value)} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="field" type="email" value={profile.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="field" value={profile.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="field" value={profile.location ?? ""} onChange={(e) => set("location", e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Headline</label>
                <input className="field" placeholder="e.g. Senior Full-Stack Engineer · React + Django" value={profile.headline ?? ""} onChange={(e) => set("headline", e.target.value)} />
              </div>
              <div className="mt-4">
                <label className="label">Bio</label>
                <textarea rows={4} className="field" value={profile.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
              </div>
            </section>

            <section className="card-surface">
              <h2 className="font-display text-xl">Education & experience</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="label">Education</label>
                  <select className="field" value={profile.education} onChange={(e) => set("education", e.target.value)}>
                    {EDUCATION_OPTIONS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Major / field</label>
                  <input className="field" value={profile.major ?? ""} onChange={(e) => set("major", e.target.value)} />
                </div>
                <div>
                  <label className="label">Years experience</label>
                  <input type="number" min={0} className="field" value={profile.years_experience} onChange={(e) => set("years_experience", Number(e.target.value))} />
                </div>
              </div>
            </section>

            <section className="card-surface">
              <h2 className="font-display text-xl">Skills</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These power your job recommendations. Be specific.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  className="field"
                  placeholder="Add a skill, e.g. React"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button type="button" className="btn-ghost" onClick={addSkill}>
                  Add
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("skills", profile.skills.filter((x) => x !== s))}
                    className="chip-lime"
                  >
                    {s} ✕
                  </button>
                ))}
                {profile.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills yet.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4">

            {/* ── Resume upload card ── */}
            <div className="card-surface">
              <h3 className="font-display text-lg">Resume</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF only · max 10 MB. Employers can download your resume when you apply.
              </p>

              {profile.resume_filename ? (
                /* File already uploaded */
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-[var(--color-lime)] bg-[var(--color-lime)]/15 px-3 py-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 shrink-0 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17h-1v-5h1v5zm3.5 0h-1v-2h-1v-1h1v-2h1v5zm3.5 0h-2.5v-5h1v4h1.5v1z"/>
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {profile.resume_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">PDF · Uploaded</p>
                    </div>
                    {profile.resume_url && (
                      <a
                        href={profile.resume_url}
                        download={profile.resume_filename}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium hover:bg-accent"
                        title="Preview / download"
                      >
                        View
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <label className="btn-ghost flex-1 cursor-pointer text-center text-sm">
                      Replace PDF
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={onUpload}
                        disabled={uploading}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={removeResume}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-destructive transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* No file yet — drop zone style */
                <label className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition hover:border-[var(--color-ink)] hover:bg-accent ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-foreground">
                    {uploading ? "Uploading…" : "Click to upload PDF"}
                  </span>
                  <span className="text-xs text-muted-foreground">PDF only · max 10 MB</span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={onUpload}
                    disabled={uploading}
                  />
                </label>
              )}

              {uploadMsg && (
                <p className={`mt-2 text-xs ${uploadMsg.includes("success") ? "text-green-600" : "text-destructive"}`}>
                  {uploadMsg}
                </p>
              )}
            </div>

            {/* ── Save button ── */}
            <div className="card-surface sticky top-24">
              <button type="submit" disabled={saving} className="btn-lime w-full">
                {saving ? "Saving…" : "Save profile"}
              </button>
              {saveMsg && <p className="mt-3 text-center text-xs text-muted-foreground">{saveMsg}</p>}
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
