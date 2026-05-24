from candidates.models import CandidateProfile
from candidates.serializers import CandidateProfileSerializer
from jobs.models import JobPosting
from jobs.serializers import JobPostingSerializer

EDU_RANK = {"Diploma": 1, "Bachelor": 2, "Master": 3, "PhD": 4}


def score_job_for_candidate(job, candidate):
    reasons = []
    score = 0.0

    candidate_skills = {skill.lower() for skill in candidate.skills}
    matched_skills = [skill for skill in job.required_skills if skill.lower() in candidate_skills]
    skill_ratio = len(matched_skills) / len(job.required_skills) if job.required_skills else 0
    score += 0.55 * skill_ratio
    if matched_skills:
        reasons.append(f"{len(matched_skills)}/{len(job.required_skills)} required skills match")

    if EDU_RANK.get(candidate.education, 0) >= EDU_RANK.get(job.required_education, 0):
        score += 0.20
        reasons.append(f"Meets {job.required_education} education")

    if candidate.years_experience >= job.min_years_experience:
        score += 0.15
        reasons.append(f"{candidate.years_experience}y experience >= {job.min_years_experience}y required")
    else:
        score += 0.15 * (candidate.years_experience / max(1, job.min_years_experience))

    if candidate.location and job.location:
        job_city = job.location.split(",")[0].strip().lower()
        if job_city and job_city in candidate.location.lower():
            score += 0.05
            reasons.append("Same location")

    if job.work_mode == "Remote":
        score += 0.05
        reasons.append("Remote-friendly")

    return {"score": min(1.0, round(score, 4)), "reasons": reasons}


def ranked_jobs_for_candidate(candidate, limit=10):
    ranked = []
    for job in JobPosting.objects.all():
        result = score_job_for_candidate(job, candidate)
        ranked.append({
            "job": JobPostingSerializer(job).data,
            "score": result["score"],
            "reasons": result["reasons"],
        })
    return sorted(ranked, key=lambda item: item["score"], reverse=True)[:limit]


def ranked_candidates_for_job(job, limit=10):
    ranked = []
    for candidate in CandidateProfile.objects.all():
        result = score_job_for_candidate(job, candidate)
        ranked.append({
            "candidate": CandidateProfileSerializer(candidate).data,
            "score": result["score"],
            "reasons": result["reasons"],
        })
    return sorted(ranked, key=lambda item: item["score"], reverse=True)[:limit]
