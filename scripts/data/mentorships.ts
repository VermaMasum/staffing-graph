export interface MentorshipSeed {
  mentorId: string;
  menteeId: string;
  skill: string;
}

export const mentorships: MentorshipSeed[] = [
  { mentorId: "p01", menteeId: "p02", skill: "TypeScript" },
  { mentorId: "p03", menteeId: "p22", skill: "React" },
  { mentorId: "p04", menteeId: "p05", skill: "Machine Learning" },
  { mentorId: "p09", menteeId: "p10", skill: "Security" },
  { mentorId: "p26", menteeId: "p12", skill: "Kubernetes" },
  { mentorId: "p16", menteeId: "p18", skill: "UI Design" },
  { mentorId: "p13", menteeId: "p15", skill: "Data Engineering" },
];
