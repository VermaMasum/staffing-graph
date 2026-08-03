import { SkillLevel } from "./people";

export interface RequiredSkillSeed {
  name: string;
  minLevel: SkillLevel;
}

export interface RosterEntrySeed {
  personId: string;
  role: string;
  start: string; // YYYY-MM-DD
  end: string | null;
}

export interface ProjectSeed {
  id: string;
  name: string;
  description: string;
  domain: string;
  status: "staffing" | "active" | "completed";
  requiredSkills: RequiredSkillSeed[];
  roster: RosterEntrySeed[];
}

export const projects: ProjectSeed[] = [
  // --- Staffing: open roles, need candidates -----------------------------
  {
    id: "proj-checkout-revamp",
    name: "Checkout Revamp",
    description:
      "Rebuild the checkout funnel end-to-end to cut drop-off, with a new React front end and a Node.js/PostgreSQL backend.",
    domain: "Growth",
    status: "staffing",
    requiredSkills: [
      { name: "React", minLevel: "advanced" },
      { name: "TypeScript", minLevel: "advanced" },
      { name: "Node.js", minLevel: "intermediate" },
      { name: "PostgreSQL", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p01", role: "Tech Lead", start: "2026-07-01", end: null },
    ],
  },
  {
    id: "proj-fraud-ml",
    name: "Fraud Detection ML",
    description:
      "Ship a real-time fraud scoring model for the payments pipeline, from feature pipeline to production inference.",
    domain: "Data & ML",
    status: "staffing",
    requiredSkills: [
      { name: "Python", minLevel: "advanced" },
      { name: "Machine Learning", minLevel: "advanced" },
      { name: "Spark", minLevel: "intermediate" },
      { name: "SQL", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p04", role: "Tech Lead", start: "2026-07-15", end: null },
    ],
  },
  {
    id: "proj-wallet-redesign",
    name: "Wallet Redesign",
    description:
      "Redesign the mobile wallet experience with a new React Native app shell and refreshed interaction design.",
    domain: "Mobile",
    status: "staffing",
    requiredSkills: [
      { name: "React Native", minLevel: "advanced" },
      { name: "iOS", minLevel: "intermediate" },
      { name: "UX Design", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p07", role: "Tech Lead", start: "2026-07-20", end: null },
    ],
  },

  // --- Active ---------------------------------------------------------
  {
    id: "proj-payments-platform",
    name: "Payments Platform",
    description:
      "Core payments infrastructure: ledger service, PCI-scoped network boundary, and settlement pipeline.",
    domain: "Platform",
    status: "active",
    requiredSkills: [
      { name: "Go", minLevel: "advanced" },
      { name: "Security", minLevel: "advanced" },
      { name: "AWS", minLevel: "advanced" },
      { name: "Kubernetes", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p09", role: "Security Lead", start: "2025-09-01", end: null },
      { personId: "p26", role: "Principal Advisor", start: "2025-09-01", end: null },
      { personId: "p11", role: "Engineer", start: "2025-10-01", end: null },
      { personId: "p12", role: "Engineer", start: "2026-01-15", end: null },
    ],
  },
  {
    id: "proj-data-lake",
    name: "Data Lake Migration",
    description: "Migrate the analytics data lake off legacy batch jobs onto a managed Spark + Airflow stack.",
    domain: "Data & ML",
    status: "active",
    requiredSkills: [
      { name: "Data Engineering", minLevel: "advanced" },
      { name: "Airflow", minLevel: "intermediate" },
      { name: "Spark", minLevel: "advanced" },
    ],
    roster: [
      { personId: "p13", role: "Tech Lead", start: "2025-11-01", end: null },
      { personId: "p14", role: "Engineer", start: "2025-11-01", end: null },
      { personId: "p15", role: "Engineer", start: "2026-02-01", end: null },
    ],
  },
  {
    id: "proj-design-system",
    name: "Design System 2.0",
    description: "Rebuild the shared component library and Figma library that underpin every product surface.",
    domain: "Design",
    status: "active",
    requiredSkills: [
      { name: "Figma", minLevel: "advanced" },
      { name: "UI Design", minLevel: "advanced" },
      { name: "UX Design", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p16", role: "Design Lead", start: "2025-08-01", end: null },
      { personId: "p17", role: "Designer", start: "2025-08-01", end: null },
      { personId: "p18", role: "Designer", start: "2025-09-01", end: null },
      { personId: "p08", role: "Engineering Partner", start: "2025-10-01", end: null },
    ],
  },
  {
    id: "proj-api-gateway",
    name: "API Gateway",
    description: "Owns the shared edge gateway: routing, auth, rate limiting, and observability for all internal APIs.",
    domain: "Platform",
    status: "active",
    requiredSkills: [
      { name: "Go", minLevel: "advanced" },
      { name: "Kubernetes", minLevel: "advanced" },
      { name: "CI/CD", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p11", role: "Tech Lead", start: "2025-06-01", end: null },
      { personId: "p12", role: "Engineer", start: "2025-09-01", end: null },
      { personId: "p26", role: "Advisor", start: "2025-06-01", end: null },
    ],
  },

  // --- Completed --------------------------------------------------------
  {
    id: "proj-legacy-auth",
    name: "Legacy Auth Migration",
    description: "Migrated the monolith's session-based auth to a token-based service ahead of the payments launch.",
    domain: "Platform",
    status: "completed",
    requiredSkills: [
      { name: "Node.js", minLevel: "advanced" },
      { name: "Security", minLevel: "intermediate" },
      { name: "PostgreSQL", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p01", role: "Tech Lead", start: "2024-11-01", end: "2025-04-30" },
      { personId: "p02", role: "Engineer", start: "2024-11-01", end: "2025-04-30" },
      { personId: "p10", role: "Engineer", start: "2025-01-01", end: "2025-04-30" },
      { personId: "p09", role: "Security Advisor", start: "2024-11-01", end: "2025-04-30" },
    ],
  },
  {
    id: "proj-analytics-dashboard",
    name: "Internal Analytics Dashboard",
    description: "Built the internal dashboard product and growth teams use to track experiment results.",
    domain: "Data & ML",
    status: "completed",
    requiredSkills: [
      { name: "Python", minLevel: "intermediate" },
      { name: "SQL", minLevel: "advanced" },
      { name: "React", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p04", role: "Tech Lead", start: "2024-06-01", end: "2024-12-15" },
      { personId: "p05", role: "Data Scientist", start: "2024-06-01", end: "2024-12-15" },
      { personId: "p20", role: "Engineer", start: "2024-07-01", end: "2024-12-15" },
      { personId: "p21", role: "QA Engineer", start: "2024-09-01", end: "2024-12-15" },
    ],
  },
  {
    id: "proj-onboarding",
    name: "Onboarding Flow Redesign",
    description: "Redesigned first-run onboarding for the mobile app, cutting time-to-first-transaction significantly.",
    domain: "Mobile",
    status: "completed",
    requiredSkills: [
      { name: "React Native", minLevel: "intermediate" },
      { name: "UX Design", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p07", role: "Tech Lead", start: "2024-09-01", end: "2025-02-28" },
      { personId: "p08", role: "Engineer", start: "2024-09-01", end: "2025-02-28" },
      { personId: "p24", role: "Engineer", start: "2024-10-01", end: "2025-02-28" },
    ],
  },
  {
    id: "proj-experimentation",
    name: "Experimentation Platform",
    description: "Built the in-house A/B testing platform used across the growth org.",
    domain: "Growth",
    status: "completed",
    requiredSkills: [
      { name: "Node.js", minLevel: "intermediate" },
      { name: "React", minLevel: "intermediate" },
      { name: "QA Automation", minLevel: "intermediate" },
    ],
    roster: [
      { personId: "p19", role: "Tech Lead", start: "2024-03-01", end: "2024-10-31" },
      { personId: "p20", role: "Engineer", start: "2024-03-01", end: "2024-10-31" },
      { personId: "p21", role: "QA Engineer", start: "2024-05-01", end: "2024-10-31" },
      { personId: "p03", role: "Consulting Engineer", start: "2024-06-01", end: "2024-08-31" },
    ],
  },
];
