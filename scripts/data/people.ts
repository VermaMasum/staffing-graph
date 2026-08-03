export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface PersonSkillSeed {
  name: string;
  level: SkillLevel;
  years: number;
}

export interface PersonSeed {
  id: string;
  name: string;
  title: string;
  seniority: "Junior" | "Mid" | "Senior" | "Staff" | "Principal";
  location: string;
  bio: string;
  teamId: string;
  avatarColor: string;
  skills: PersonSkillSeed[];
}

// A distinct accent color per person, used as a fallback avatar in the UI.
const palette = [
  "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#f43f5e", "#84cc16", "#3b82f6", "#d946ef",
];
const colorFor = (i: number) => palette[i % palette.length];

export const people: PersonSeed[] = [
  {
    id: "p01", name: "Maria Chen", title: "Staff Software Engineer", seniority: "Staff",
    location: "Austin, TX", teamId: "team-growth", avatarColor: colorFor(0),
    bio: "Staff engineer leading front-end architecture for growth surfaces; turns gnarly checkout flows into simple ones.",
    skills: [
      { name: "React", level: "expert", years: 7 },
      { name: "TypeScript", level: "expert", years: 6 },
      { name: "Node.js", level: "advanced", years: 6 },
      { name: "PostgreSQL", level: "intermediate", years: 4 },
      { name: "GraphQL", level: "advanced", years: 5 },
    ],
  },
  {
    id: "p02", name: "James Whitfield", title: "Senior Software Engineer", seniority: "Senior",
    location: "Denver, CO", teamId: "team-growth", avatarColor: colorFor(1),
    bio: "Senior engineer who cut his teeth on design systems before moving into product engineering.",
    skills: [
      { name: "React", level: "advanced", years: 5 },
      { name: "TypeScript", level: "advanced", years: 4 },
      { name: "Node.js", level: "intermediate", years: 3 },
      { name: "CSS", level: "advanced", years: 5 },
    ],
  },
  {
    id: "p03", name: "Elena Novak", title: "Senior Software Engineer", seniority: "Senior",
    location: "Toronto, ON", teamId: "team-platform", avatarColor: colorFor(2),
    bio: "Full-stack engineer with a habit of writing the tests before anyone asks.",
    skills: [
      { name: "React", level: "advanced", years: 5 },
      { name: "TypeScript", level: "advanced", years: 5 },
      { name: "Node.js", level: "advanced", years: 5 },
      { name: "PostgreSQL", level: "intermediate", years: 3 },
    ],
  },
  {
    id: "p04", name: "David Okafor", title: "Senior Data Scientist", seniority: "Senior",
    location: "Lagos, NG", teamId: "team-data-ml", avatarColor: colorFor(3),
    bio: "Leads applied ML efforts on risk and trust; previously built fraud models at two fintech startups.",
    skills: [
      { name: "Python", level: "expert", years: 8 },
      { name: "Machine Learning", level: "expert", years: 7 },
      { name: "Spark", level: "advanced", years: 5 },
      { name: "SQL", level: "advanced", years: 6 },
    ],
  },
  {
    id: "p05", name: "Aisha Rahman", title: "Data Scientist", seniority: "Mid",
    location: "Karachi, PK", teamId: "team-data-ml", avatarColor: colorFor(4),
    bio: "Data scientist focused on model evaluation and fairness; mentored by David on production ML.",
    skills: [
      { name: "Python", level: "advanced", years: 4 },
      { name: "Machine Learning", level: "advanced", years: 3 },
      { name: "SQL", level: "intermediate", years: 3 },
      { name: "Spark", level: "intermediate", years: 2 },
    ],
  },
  {
    id: "p06", name: "Tom Baptiste", title: "Data Scientist", seniority: "Mid",
    location: "Montreal, QC", teamId: "team-data-ml", avatarColor: colorFor(5),
    bio: "Came from academia; strong on modeling, newer to shipping production systems.",
    skills: [
      { name: "Python", level: "advanced", years: 4 },
      { name: "Machine Learning", level: "advanced", years: 4 },
      { name: "SQL", level: "advanced", years: 4 },
    ],
  },
  {
    id: "p07", name: "Sofia Petrov", title: "Senior Mobile Engineer", seniority: "Senior",
    location: "Berlin, DE", teamId: "team-mobile", avatarColor: colorFor(6),
    bio: "Leads mobile experience for the wallet product; pairs closely with design on interaction details.",
    skills: [
      { name: "React Native", level: "expert", years: 6 },
      { name: "iOS", level: "advanced", years: 5 },
      { name: "UX Design", level: "intermediate", years: 3 },
    ],
  },
  {
    id: "p08", name: "Noah Kim", title: "Mobile Engineer", seniority: "Mid",
    location: "Seoul, KR", teamId: "team-mobile", avatarColor: colorFor(7),
    bio: "Cross-platform mobile engineer who shipped the redesigned onboarding flow.",
    skills: [
      { name: "React Native", level: "advanced", years: 3 },
      { name: "iOS", level: "intermediate", years: 3 },
      { name: "Android", level: "intermediate", years: 2 },
    ],
  },
  {
    id: "p09", name: "Priya Nair", title: "Staff Security Engineer", seniority: "Staff",
    location: "Bengaluru, IN", teamId: "team-platform", avatarColor: colorFor(8),
    bio: "The person people page when something looks like a security incident; also quietly mentors juniors on secure coding.",
    skills: [
      { name: "Security", level: "expert", years: 9 },
      { name: "Go", level: "advanced", years: 5 },
      { name: "AWS", level: "advanced", years: 6 },
      { name: "Kubernetes", level: "intermediate", years: 4 },
    ],
  },
  {
    id: "p10", name: "Ben Ortiz", title: "Software Engineer", seniority: "Mid",
    location: "Mexico City, MX", teamId: "team-platform", avatarColor: colorFor(9),
    bio: "Backend engineer building out platform security tooling; mentee of Priya.",
    skills: [
      { name: "Security", level: "intermediate", years: 2 },
      { name: "Go", level: "intermediate", years: 2 },
      { name: "AWS", level: "intermediate", years: 2 },
      { name: "Docker", level: "intermediate", years: 2 },
    ],
  },
  {
    id: "p11", name: "Grace Liu", title: "Senior Software Engineer", seniority: "Senior",
    location: "San Francisco, CA", teamId: "team-platform", avatarColor: colorFor(0),
    bio: "Owns the API gateway; obsessed with p99 latency.",
    skills: [
      { name: "Go", level: "advanced", years: 5 },
      { name: "Kubernetes", level: "advanced", years: 4 },
      { name: "Docker", level: "advanced", years: 5 },
      { name: "AWS", level: "advanced", years: 5 },
    ],
  },
  {
    id: "p12", name: "Marcus Webb", title: "Software Engineer", seniority: "Mid",
    location: "Chicago, IL", teamId: "team-platform", avatarColor: colorFor(1),
    bio: "Platform engineer, recently rotated in from the mobile team.",
    skills: [
      { name: "Go", level: "intermediate", years: 3 },
      { name: "Kubernetes", level: "intermediate", years: 2 },
      { name: "CI/CD", level: "intermediate", years: 3 },
    ],
  },
  {
    id: "p13", name: "Fatima Al-Sayed", title: "Senior Data Engineer", seniority: "Senior",
    location: "Dubai, AE", teamId: "team-data-ml", avatarColor: colorFor(2),
    bio: "Built the data lake from scratch; the one person who understands all the historical pipeline quirks.",
    skills: [
      { name: "Data Engineering", level: "expert", years: 6 },
      { name: "Airflow", level: "advanced", years: 5 },
      { name: "Spark", level: "advanced", years: 5 },
      { name: "SQL", level: "advanced", years: 6 },
    ],
  },
  {
    id: "p14", name: "Leo Fischer", title: "Data Engineer", seniority: "Mid",
    location: "Vienna, AT", teamId: "team-data-ml", avatarColor: colorFor(3),
    bio: "Data engineer focused on pipeline reliability and observability.",
    skills: [
      { name: "Data Engineering", level: "advanced", years: 3 },
      { name: "Airflow", level: "intermediate", years: 3 },
      { name: "SQL", level: "advanced", years: 4 },
    ],
  },
  {
    id: "p15", name: "Hana Suzuki", title: "Data Engineer", seniority: "Mid",
    location: "Osaka, JP", teamId: "team-data-ml", avatarColor: colorFor(4),
    bio: "Newer data engineer, ramping up on the streaming stack.",
    skills: [
      { name: "Data Engineering", level: "intermediate", years: 2 },
      { name: "Spark", level: "intermediate", years: 2 },
      { name: "Python", level: "intermediate", years: 3 },
    ],
  },
  {
    id: "p16", name: "Olivia Bennett", title: "Senior Product Designer", seniority: "Senior",
    location: "London, UK", teamId: "team-design", avatarColor: colorFor(5),
    bio: "Design systems lead; thinks in components and tokens.",
    skills: [
      { name: "UX Design", level: "expert", years: 7 },
      { name: "UI Design", level: "advanced", years: 6 },
      { name: "Figma", level: "expert", years: 7 },
    ],
  },
  {
    id: "p17", name: "Yusuf Demir", title: "Product Designer", seniority: "Mid",
    location: "Istanbul, TR", teamId: "team-design", avatarColor: colorFor(6),
    bio: "Product designer who partners closely with mobile engineering.",
    skills: [
      { name: "UI Design", level: "advanced", years: 4 },
      { name: "Figma", level: "advanced", years: 4 },
      { name: "UX Design", level: "intermediate", years: 3 },
    ],
  },
  {
    id: "p18", name: "Chloe Martin", title: "Product Designer", seniority: "Mid",
    location: "Paris, FR", teamId: "team-design", avatarColor: colorFor(7),
    bio: "Design systems contributor with a growing interest in content design.",
    skills: [
      { name: "Figma", level: "advanced", years: 3 },
      { name: "UI Design", level: "intermediate", years: 3 },
      { name: "Technical Writing", level: "intermediate", years: 2 },
    ],
  },
  {
    id: "p19", name: "Ahmed Hassan", title: "Senior Software Engineer", seniority: "Senior",
    location: "Cairo, EG", teamId: "team-growth", avatarColor: colorFor(8),
    bio: "Backend-leaning full-stack engineer on the growth team.",
    skills: [
      { name: "Node.js", level: "advanced", years: 5 },
      { name: "PostgreSQL", level: "advanced", years: 5 },
      { name: "GraphQL", level: "advanced", years: 4 },
      { name: "React", level: "intermediate", years: 3 },
    ],
  },
  {
    id: "p20", name: "Ravi Shankar", title: "Software Engineer", seniority: "Mid",
    location: "Pune, IN", teamId: "team-growth", avatarColor: colorFor(9),
    bio: "Growth engineer focused on experimentation infrastructure.",
    skills: [
      { name: "Node.js", level: "intermediate", years: 3 },
      { name: "PostgreSQL", level: "intermediate", years: 3 },
      { name: "React", level: "intermediate", years: 2 },
    ],
  },
  {
    id: "p21", name: "Isabella Rossi", title: "Senior QA Engineer", seniority: "Senior",
    location: "Milan, IT", teamId: "team-growth", avatarColor: colorFor(0),
    bio: "Owns test strategy for the checkout funnel; catches the edge cases everyone else misses.",
    skills: [
      { name: "QA Automation", level: "expert", years: 6 },
      { name: "CI/CD", level: "advanced", years: 4 },
      { name: "TypeScript", level: "intermediate", years: 3 },
    ],
  },
  {
    id: "p22", name: "Daniel Kim", title: "Software Engineer", seniority: "Junior",
    location: "Vancouver, BC", teamId: "team-platform", avatarColor: colorFor(1),
    bio: "Recently promoted from intern; mentored by Elena on full-stack fundamentals.",
    skills: [
      { name: "TypeScript", level: "intermediate", years: 2 },
      { name: "React", level: "intermediate", years: 2 },
      { name: "Node.js", level: "beginner", years: 1 },
    ],
  },
  {
    id: "p23", name: "Nadia Petrova", title: "Senior ML Engineer", seniority: "Senior",
    location: "Sofia, BG", teamId: "team-data-ml", avatarColor: colorFor(2),
    bio: "MLOps-focused engineer bridging data science and production infrastructure.",
    skills: [
      { name: "Machine Learning", level: "advanced", years: 5 },
      { name: "Python", level: "advanced", years: 5 },
      { name: "AWS", level: "intermediate", years: 3 },
    ],
  },
  {
    id: "p24", name: "Lucas Silva", title: "Software Engineer", seniority: "Mid",
    location: "Sao Paulo, BR", teamId: "team-mobile", avatarColor: colorFor(3),
    bio: "Android specialist who recently picked up React Native for cross-platform work.",
    skills: [
      { name: "Android", level: "advanced", years: 4 },
      { name: "React Native", level: "intermediate", years: 2 },
      { name: "Java", level: "advanced", years: 4 },
    ],
  },
  {
    id: "p25", name: "Emma Johansson", title: "Engineering Manager", seniority: "Staff",
    location: "Stockholm, SE", teamId: "team-growth", avatarColor: colorFor(4),
    bio: "Manages the growth engineering pod; still writes code when she can find the time.",
    skills: [
      { name: "Product Management", level: "advanced", years: 4 },
      { name: "Node.js", level: "intermediate", years: 3 },
      { name: "React", level: "intermediate", years: 2 },
    ],
  },
  {
    id: "p26", name: "Wei Zhang", title: "Principal Engineer", seniority: "Principal",
    location: "Shanghai, CN", teamId: "team-platform", avatarColor: colorFor(5),
    bio: "Principal engineer setting technical direction for the platform org; works closely with Priya on the payments platform's infra.",
    skills: [
      { name: "Go", level: "expert", years: 9 },
      { name: "Kubernetes", level: "expert", years: 8 },
      { name: "AWS", level: "expert", years: 8 },
      { name: "Terraform", level: "advanced", years: 6 },
    ],
  },
];
