export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface Skill {
  name: string;
  category: string;
}

export interface PersonSummary {
  id: string;
  name: string;
  title: string;
  seniority: string;
  location: string;
  avatarColor: string;
}

export interface PersonDetail extends PersonSummary {
  bio: string;
  skills: { name: string; category: string; level: SkillLevel; years: number }[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  domain: string;
  status: "staffing" | "active" | "completed";
  requiredSkillCount: number;
  staffedCount: number;
}

export interface ProjectDetail extends ProjectSummary {
  requiredSkills: { name: string; category: string; minLevel: SkillLevel }[];
  team: { person: PersonSummary; role: string }[];
}

export interface CandidateMatch {
  person: PersonSummary;
  matchedSkills: { name: string; level: SkillLevel; meetsMinLevel: boolean }[];
  missingSkills: string[];
  skillScore: number;
  collaborators: { person: PersonSummary; sharedProjects: string[] }[];
  collaborationScore: number;
  totalScore: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "Person" | "Skill" | "Project" | "Team";
  detail?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  detail?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
