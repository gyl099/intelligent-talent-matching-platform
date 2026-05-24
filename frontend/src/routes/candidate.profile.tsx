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
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadMsg("Please upload a PDF.");
      return;
    }
    setUploadMsg("Uploading…");
    try {
      const res = await api.uploadResume(file);
      setProfile({ ...profile, resume_filename: res.resume_filename, resume_url: res.resume_url });
      setUploadMsg(`Uploaded ${res.resume_filename}`);
    } catch (err) {
      setUploadMsg((err as Error).message);
    }
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
            <div className="card-surface">
              <h3 className="font-display text-lg">Resume</h3>
              <p className="mt-1 text-xs text-muted-foreground">PDF only. Uploaded to Django storage.</p>
              <label className="btn-ghost mt-4 w-full cursor-pointer">
                {profile.resume_filename ? "Replace PDF" : "Upload PDF"}
                <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} />
              </label>
              {profile.resume_filename && (
                <p className="mt-3 text-xs text-foreground">📎 {profile.resume_filename}</p>
              )}
              {uploadMsg && <p className="mt-2 text-xs text-muted-foreground">{uploadMsg}</p>}
            </div>

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
