import type { CandidateProfile, WorkMode } from "./api";

export const seedJobs: Array<{
  employer_email: string;
  title: string;
  company: string;
  description: string;
  required_education: string;
  required_skills: string[];
  min_years_experience: number;
  work_mode: WorkMode;
  location: string;
  salary_min?: number;
  salary_max?: number;
}> = [
  {
    employer_email: "hiring@northwind.io",
    title: "Senior Full-Stack Engineer",
    company: "Northwind Labs",
    description:
      "Build the next generation of our analytics platform. You'll own end-to-end features across our React frontend and Django REST backend. Strong PostgreSQL and system-design chops expected.",
    required_education: "Bachelor",
    required_skills: ["React", "TypeScript", "Django", "PostgreSQL", "Docker"],
    min_years_experience: 4,
    work_mode: "Hybrid",
    location: "Singapore",
    salary_min: 9000,
    salary_max: 13000,
  },
  {
    employer_email: "talent@orbital.dev",
    title: "Frontend Engineer, Design Systems",
    company: "Orbital",
    description:
      "Shape our design system from the ground up. Pixel-obsessed, motion-aware, and a deep love for accessibility. You'll work directly with our design team to ship a token-driven component library.",
    required_education: "Bachelor",
    required_skills: ["React", "TypeScript", "Tailwind CSS", "Figma"],
    min_years_experience: 3,
    work_mode: "Remote",
    location: "Remote (APAC)",
    salary_min: 7000,
    salary_max: 10000,
  },
  {
    employer_email: "jobs@kestrel.ai",
    title: "Machine Learning Engineer",
    company: "Kestrel AI",
    description:
      "Train and deploy ranking models for our recommendation pipeline. Strong Python, PyTorch, and production ML systems experience required.",
    required_education: "Master",
    required_skills: ["Python", "PyTorch", "MLOps", "PostgreSQL"],
    min_years_experience: 3,
    work_mode: "On-site",
    location: "Sydney, AU",
    salary_min: 11000,
    salary_max: 16000,
  },
  {
    employer_email: "hiring@northwind.io",
    title: "Backend Engineer (Django)",
    company: "Northwind Labs",
    description:
      "Own our core API surface. Django, DRF, PostgreSQL, Celery. You write tests first and care about query plans.",
    required_education: "Bachelor",
    required_skills: ["Python", "Django", "PostgreSQL", "Celery", "Redis"],
    min_years_experience: 2,
    work_mode: "Hybrid",
    location: "Singapore",
    salary_min: 7500,
    salary_max: 11000,
  },
  {
    employer_email: "talent@orbital.dev",
    title: "Product Designer",
    company: "Orbital",
    description:
      "Lead product design across our web app. From discovery through high-fidelity. Comfortable in Figma, prototyping with code is a plus.",
    required_education: "Diploma",
    required_skills: ["Figma", "Prototyping", "UX Research"],
    min_years_experience: 4,
    work_mode: "Remote",
    location: "Remote",
    salary_min: 6000,
    salary_max: 9000,
  },
  {
    employer_email: "people@helix.tech",
    title: "DevOps Engineer",
    company: "Helix",
    description:
      "Run our Kubernetes fleet across three regions. Terraform, ArgoCD, Prometheus. You enjoy debugging production at 3am — but mostly you make sure that never happens.",
    required_education: "Bachelor",
    required_skills: ["Kubernetes", "Terraform", "AWS", "Docker", "Python"],
    min_years_experience: 4,
    work_mode: "Remote",
    location: "Remote (Global)",
    salary_min: 10000,
    salary_max: 14000,
  },
  {
    employer_email: "jobs@kestrel.ai",
    title: "Junior Data Analyst",
    company: "Kestrel AI",
    description:
      "Partner with product and growth to ship dashboards and insights. SQL fluency required. You're curious and write clean queries.",
    required_education: "Bachelor",
    required_skills: ["SQL", "Python", "Tableau"],
    min_years_experience: 0,
    work_mode: "On-site",
    location: "Sydney, AU",
    salary_min: 4500,
    salary_max: 6500,
  },
  {
    employer_email: "people@helix.tech",
    title: "Mobile Engineer (React Native)",
    company: "Helix",
    description:
      "Ship our mobile app to millions of users. Strong React Native + native bridge experience. Performance-obsessed.",
    required_education: "Bachelor",
    required_skills: ["React Native", "TypeScript", "iOS", "Android"],
    min_years_experience: 3,
    work_mode: "Hybrid",
    location: "Singapore",
    salary_min: 8000,
    salary_max: 12000,
  },
];

export const seedCandidates: Omit<CandidateProfile, "id" | "user_id">[] = [
  {
    full_name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+65 9123 4567",
    location: "Singapore",
    headline: "Senior Full-Stack Engineer · 6y · React + Django",
    bio: "Six years building product across fintech and SaaS. Comfortable owning a feature from schema to UI.",
    education: "Master",
    major: "Computer Science",
    years_experience: 6,
    skills: ["React", "TypeScript", "Django", "PostgreSQL", "Docker", "Redis"],
  },
  {
    full_name: "Priya Nair",
    email: "priya.n@example.com",
    location: "Bangalore, IN",
    headline: "Frontend Engineer · Design Systems",
    bio: "I build component libraries that designers actually want to use.",
    education: "Bachelor",
    major: "Information Systems",
    years_experience: 4,
    skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Storybook"],
  },
  {
    full_name: "Wei Lin Tan",
    email: "weilin.tan@example.com",
    location: "Singapore",
    headline: "ML Engineer · Recsys",
    bio: "Built recommendation pipelines at two startups. Ranked, calibrated, A/B tested.",
    education: "Master",
    major: "Machine Learning",
    years_experience: 3,
    skills: ["Python", "PyTorch", "MLOps", "PostgreSQL", "Airflow"],
  },
  {
    full_name: "Jordan Reyes",
    email: "j.reyes@example.com",
    location: "Remote",
    headline: "Product Designer · 5y",
    education: "Bachelor",
    major: "Industrial Design",
    years_experience: 5,
    skills: ["Figma", "Prototyping", "UX Research", "Motion"],
  },
  {
    full_name: "Sofia Larsen",
    email: "sofia.larsen@example.com",
    location: "Stockholm, SE",
    headline: "DevOps · K8s + Terraform",
    education: "Bachelor",
    major: "Computer Engineering",
    years_experience: 5,
    skills: ["Kubernetes", "Terraform", "AWS", "Docker", "Python", "Go"],
  },
  {
    full_name: "Marcus Okafor",
    email: "marcus.o@example.com",
    location: "Lagos, NG",
    headline: "Backend Engineer · Django + Postgres",
    education: "Bachelor",
    major: "Software Engineering",
    years_experience: 3,
    skills: ["Python", "Django", "PostgreSQL", "Celery", "Redis"],
  },
  {
    full_name: "Hana Kobayashi",
    email: "hana.k@example.com",
    location: "Tokyo, JP",
    headline: "React Native Engineer",
    education: "Bachelor",
    major: "Computer Science",
    years_experience: 4,
    skills: ["React Native", "TypeScript", "iOS", "Android", "GraphQL"],
  },
  {
    full_name: "Diego Alvarez",
    email: "diego.a@example.com",
    location: "Mexico City, MX",
    headline: "Data Analyst · SQL + Python",
    education: "Bachelor",
    major: "Statistics",
    years_experience: 1,
    skills: ["SQL", "Python", "Tableau", "dbt"],
  },
];
