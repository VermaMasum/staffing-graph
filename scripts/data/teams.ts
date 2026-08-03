export interface TeamSeed {
  id: string;
  name: string;
}

export const teams: TeamSeed[] = [
  { id: "team-platform", name: "Platform Engineering" },
  { id: "team-growth", name: "Growth" },
  { id: "team-data-ml", name: "Data & ML" },
  { id: "team-mobile", name: "Mobile" },
  { id: "team-design", name: "Design Systems" },
];
