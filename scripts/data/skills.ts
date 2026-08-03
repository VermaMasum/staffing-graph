export interface SkillSeed {
  name: string;
  category: string;
}

export const skills: SkillSeed[] = [
  // Frontend
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "Vue", category: "Frontend" },
  // Backend
  { name: "Node.js", category: "Backend" },
  { name: "Python", category: "Backend" },
  { name: "Go", category: "Backend" },
  { name: "Java", category: "Backend" },
  { name: "PostgreSQL", category: "Backend" },
  { name: "GraphQL", category: "Backend" },
  // Data & ML
  { name: "Machine Learning", category: "Data" },
  { name: "Data Engineering", category: "Data" },
  { name: "Spark", category: "Data" },
  { name: "SQL", category: "Data" },
  { name: "Airflow", category: "Data" },
  // Cloud & DevOps
  { name: "AWS", category: "Cloud" },
  { name: "Kubernetes", category: "Cloud" },
  { name: "Docker", category: "Cloud" },
  { name: "Terraform", category: "Cloud" },
  { name: "CI/CD", category: "Cloud" },
  // Mobile
  { name: "iOS", category: "Mobile" },
  { name: "Android", category: "Mobile" },
  { name: "React Native", category: "Mobile" },
  // Design
  { name: "UX Design", category: "Design" },
  { name: "UI Design", category: "Design" },
  { name: "Figma", category: "Design" },
  // Other
  { name: "Security", category: "Other" },
  { name: "QA Automation", category: "Other" },
  { name: "Technical Writing", category: "Other" },
];
