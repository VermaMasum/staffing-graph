import { Record as Neo4jRecord } from "neo4j-driver";
import { withSession } from "./neo4j";
import {
  CandidateMatch,
  GraphData,
  GraphLink,
  GraphNode,
  PersonDetail,
  PersonSummary,
  ProjectDetail,
  ProjectSummary,
  SkillLevel,
} from "./types";

const LEVEL_RANK: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

function toPersonSummary(node: Record<string, unknown>): PersonSummary {
  return {
    id: node.id as string,
    name: node.name as string,
    title: node.title as string,
    seniority: node.seniority as string,
    location: node.location as string,
    avatarColor: node.avatarColor as string,
  };
}

// ---------------------------------------------------------------------------
// Dashboard: list all projects with lightweight staffing stats.
// ---------------------------------------------------------------------------
export async function listProjects(): Promise<ProjectSummary[]> {
  const result = await withSession("read", (tx) =>
    tx.run(
      `MATCH (proj:Project)
       OPTIONAL MATCH (proj)-[:REQUIRES_SKILL]->(reqSkill:Skill)
       OPTIONAL MATCH (proj)<-[:WORKED_ON]-(member:Person)
       RETURN proj {.id, .name, .description, .domain, .status} AS project,
              count(DISTINCT reqSkill) AS requiredSkillCount,
              count(DISTINCT member) AS staffedCount
       ORDER BY
         CASE proj.status WHEN 'staffing' THEN 0 WHEN 'active' THEN 1 ELSE 2 END,
         proj.name`
    )
  );

  return result.records.map((record: Neo4jRecord) => {
    const project = record.get("project");
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      domain: project.domain,
      status: project.status,
      requiredSkillCount: record.get("requiredSkillCount").toNumber(),
      staffedCount: record.get("staffedCount").toNumber(),
    };
  });
}

// ---------------------------------------------------------------------------
// Project detail: required skills + current roster.
// ---------------------------------------------------------------------------
export async function getProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  const result = await withSession("read", (tx) =>
    tx.run(
      `MATCH (proj:Project {id: $projectId})
       OPTIONAL MATCH (proj)-[req:REQUIRES_SKILL]->(skill:Skill)
       WITH proj, collect(DISTINCT CASE WHEN skill IS NULL THEN NULL
            ELSE {name: skill.name, category: skill.category, minLevel: req.minLevel} END) AS requiredSkills
       OPTIONAL MATCH (proj)<-[w:WORKED_ON]-(member:Person)
       RETURN proj {.id, .name, .description, .domain, .status} AS project,
              [s IN requiredSkills WHERE s IS NOT NULL] AS requiredSkills,
              collect(DISTINCT CASE WHEN member IS NULL THEN NULL
                ELSE {person: member {.id, .name, .title, .seniority, .location, .avatarColor}, role: w.role} END) AS team`,
      { projectId }
    )
  );

  if (result.records.length === 0) return null;
  const record = result.records[0];
  const project = record.get("project");
  if (!project) return null;

  const team = (record.get("team") as Array<{ person: Record<string, unknown>; role: string } | null>)
    .filter((t): t is { person: Record<string, unknown>; role: string } => t !== null)
    .map((t) => ({ person: toPersonSummary(t.person), role: t.role }));

  const requiredSkills = record.get("requiredSkills") as {
    name: string;
    category: string;
    minLevel: SkillLevel;
  }[];

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    domain: project.domain,
    status: project.status,
    requiredSkillCount: requiredSkills.length,
    staffedCount: team.length,
    requiredSkills,
    team,
  };
}

// ---------------------------------------------------------------------------
// Candidate ranking for a "staffing" project. Three focused, single-chain
// Cypher queries gather the raw signal; scoring/ranking happens in
// application code where it's easier to read, test and tune.
//
//   Query A: Project -[:REQUIRES_SKILL]-> Skill                          (1 hop)
//   Query B: Project <-[:WORKED_ON]- Person                              (1 hop, current roster)
//   Query C: Person -[:HAS_SKILL]-> Skill                                (1 hop, all candidates)
//   Query D: ExistingMember -[:WORKED_ON]-> Project <-[:WORKED_ON]- Candidate (2 hops, one chain)
//
// Each query is a single unbroken MATCH pattern with no property filter
// re-applied to a node that was bound in an earlier, separate clause —
// CognoDB's early-access query planner was found (via direct testing) to
// silently mis-evaluate relationship existence checks between two
// independently-bound nodes, e.g. `NOT (candidate)-[:WORKED_ON]->(proj)`
// where both `candidate` and `proj` come from prior clauses. Set membership
// (which candidates already worked on this project, who's on the current
// team) is instead computed in application code, which is both a safe
// workaround and, frankly, the more readable place for it.
//
// This is exactly the kind of question a relational schema makes awkward:
// "rank people by both a skill-set overlap AND whether they've already
// worked with someone on the team" means joining the same table twice
// through two different relationship types, then aggregating both.
// ---------------------------------------------------------------------------
export async function getCandidatesForProject(projectId: string): Promise<CandidateMatch[]> {
  const requiredResult = await withSession("read", (tx) =>
    tx.run(
      `MATCH (:Project {id: $projectId})-[req:REQUIRES_SKILL]->(skill:Skill)
       RETURN skill.name AS name, req.minLevel AS minLevel`,
      { projectId }
    )
  );
  const required = requiredResult.records.map((r) => ({
    name: r.get("name") as string,
    minLevel: r.get("minLevel") as SkillLevel,
  }));
  const requiredNames = required.map((r) => r.name);

  const rosterResult = await withSession("read", (tx) =>
    tx.run(`MATCH (:Project {id: $projectId})<-[:WORKED_ON]-(member:Person) RETURN member.id AS id`, {
      projectId,
    })
  );
  const staffedIds = new Set(rosterResult.records.map((r) => r.get("id") as string));

  const skillMatches = await withSession("read", (tx) =>
    tx.run(
      `MATCH (candidate:Person)-[hs:HAS_SKILL]->(skill:Skill)
       WHERE skill.name IN $requiredNames
       RETURN candidate {.id, .name, .title, .seniority, .location, .avatarColor} AS person,
              collect({name: skill.name, level: hs.level}) AS matched`,
      { requiredNames }
    )
  );

  const collaborationMatches = await withSession("read", (tx) =>
    tx.run(
      `MATCH (existingMember:Person)-[:WORKED_ON]->(sharedProject:Project)<-[:WORKED_ON]-(candidate:Person)
       WHERE candidate <> existingMember
       RETURN existingMember.id AS existingMemberId,
              existingMember {.id, .name, .title, .seniority, .location, .avatarColor} AS existingMember,
              candidate.id AS candidateId,
              sharedProject.name AS sharedProject`,
      {}
    )
  );

  const collaborationByCandidate = new Map<
    string,
    { person: PersonSummary; sharedProjects: string[] }[]
  >();
  for (const record of collaborationMatches.records) {
    const existingMemberId = record.get("existingMemberId") as string;
    if (!staffedIds.has(existingMemberId)) continue; // only collaborations with THIS project's team

    const candidateId = record.get("candidateId") as string;
    if (staffedIds.has(candidateId)) continue; // already on the team, not a candidate

    const personSummary = toPersonSummary(record.get("existingMember"));
    const sharedProject = record.get("sharedProject") as string;

    const list = collaborationByCandidate.get(candidateId) ?? [];
    const existing = list.find((c) => c.person.id === personSummary.id);
    if (existing) existing.sharedProjects.push(sharedProject);
    else list.push({ person: personSummary, sharedProjects: [sharedProject] });
    collaborationByCandidate.set(candidateId, list);
  }

  const candidates: CandidateMatch[] = skillMatches.records
    .map((record) => {
      const person = toPersonSummary(record.get("person"));
      const matched = record.get("matched") as { name: string; level: SkillLevel }[];

      const matchedByName = new Map(matched.map((m) => [m.name, m.level]));
      const matchedSkills = required
        .filter((r) => matchedByName.has(r.name))
        .map((r) => {
          const level = matchedByName.get(r.name)!;
          return { name: r.name, level, meetsMinLevel: LEVEL_RANK[level] >= LEVEL_RANK[r.minLevel] };
        });
      const missingSkills = required.filter((r) => !matchedByName.has(r.name)).map((r) => r.name);

      const skillScore =
        required.length === 0
          ? 0
          : matchedSkills.reduce((sum, m) => sum + (m.meetsMinLevel ? 1 : 0.5), 0) / required.length;

      const collaborators = collaborationByCandidate.get(person.id) ?? [];
      const collaborationScore = Math.min(1, collaborators.length / 2);

      return {
        person,
        matchedSkills,
        missingSkills,
        skillScore,
        collaborators,
        collaborationScore,
        totalScore: skillScore * 0.7 + collaborationScore * 0.3,
      };
    })
    .filter((c) => !staffedIds.has(c.person.id));

  // De-dupe (a candidate can appear once per matched skill row in theory;
  // in practice HAS_SKILL is unique per (person, skill) so this is a no-op
  // safety net) and sort best-first.
  const byId = new Map(candidates.map((c) => [c.person.id, c]));
  return Array.from(byId.values()).sort((a, b) => b.totalScore - a.totalScore);
}

// ---------------------------------------------------------------------------
// Force-directed neighborhood for a project: the project, its required
// skills, its current team, and the top candidates being considered.
// ---------------------------------------------------------------------------
export async function getProjectNeighborhood(
  projectId: string,
  candidateIds: string[]
): Promise<GraphData> {
  const result = await withSession("read", (tx) =>
    tx.run(
      `MATCH (proj:Project {id: $projectId})
       OPTIONAL MATCH (proj)-[:REQUIRES_SKILL]->(reqSkill:Skill)
       OPTIONAL MATCH (proj)<-[:WORKED_ON]-(member:Person)
       RETURN proj {.id, .name} AS project,
              collect(DISTINCT reqSkill {.name}) AS skills,
              collect(DISTINCT CASE WHEN member IS NULL THEN NULL ELSE member {.id, .name, .avatarColor} END) AS team`,
      { projectId }
    )
  );

  if (result.records.length === 0) return { nodes: [], links: [] };
  const record = result.records[0];
  const project = record.get("project");

  const nodes: GraphNode[] = [{ id: `project:${project.id}`, label: project.name, type: "Project" }];
  const links: GraphLink[] = [];

  const skills = (record.get("skills") as { name: string }[]).filter(Boolean);
  for (const skill of skills) {
    nodes.push({ id: `skill:${skill.name}`, label: skill.name, type: "Skill" });
    links.push({ source: `project:${project.id}`, target: `skill:${skill.name}`, type: "REQUIRES" });
  }

  const team = (record.get("team") as Array<Record<string, unknown> | null>).filter(Boolean);
  for (const member of team as Record<string, unknown>[]) {
    nodes.push({ id: `person:${member.id}`, label: member.name as string, type: "Person", detail: "team" });
    links.push({ source: `person:${member.id}`, target: `project:${project.id}`, type: "WORKED_ON" });
  }

  if (candidateIds.length > 0) {
    const candidateResult = await withSession("read", (tx) =>
      tx.run(`MATCH (p:Person) WHERE p.id IN $candidateIds RETURN p {.id, .name, .avatarColor} AS person`, {
        candidateIds,
      })
    );
    for (const candidateRecord of candidateResult.records) {
      const candidate = candidateRecord.get("person");
      if (nodes.some((n) => n.id === `person:${candidate.id}`)) continue;
      nodes.push({ id: `person:${candidate.id}`, label: candidate.name, type: "Person", detail: "candidate" });
    }
  }

  return { nodes, links };
}

// ---------------------------------------------------------------------------
// Person detail.
// ---------------------------------------------------------------------------
export async function getPersonDetail(personId: string): Promise<PersonDetail | null> {
  const result = await withSession("read", (tx) =>
    tx.run(
      `MATCH (p:Person {id: $personId})
       OPTIONAL MATCH (p)-[hs:HAS_SKILL]->(s:Skill)
       RETURN p {.id, .name, .title, .seniority, .location, .avatarColor, .bio} AS person,
              collect(DISTINCT CASE WHEN s IS NULL THEN NULL
                ELSE {name: s.name, category: s.category, level: hs.level, years: hs.years} END) AS skills`,
      { personId }
    )
  );

  if (result.records.length === 0) return null;
  const record = result.records[0];
  const person = record.get("person");
  if (!person) return null;

  return {
    ...toPersonSummary(person),
    bio: person.bio,
    skills: (record.get("skills") as PersonDetail["skills"]).filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// A person's collaboration network: projects worked on, and everyone else
// who worked on those same projects. Powers the force-directed graph on the
// person page.
// ---------------------------------------------------------------------------
export async function getPersonNetwork(personId: string): Promise<GraphData> {
  const personResult = await withSession("read", (tx) =>
    tx.run(`MATCH (p:Person {id: $personId}) RETURN p {.id, .name} AS person`, { personId })
  );
  if (personResult.records.length === 0) return { nodes: [], links: [] };
  const person = personResult.records[0].get("person");

  const projectsResult = await withSession("read", (tx) =>
    tx.run(`MATCH (:Person {id: $personId})-[:WORKED_ON]->(proj:Project) RETURN proj {.id, .name} AS project`, {
      personId,
    })
  );

  // Single unbroken MATCH chain (p -> proj <- collaborator) so both hops
  // resolve against the SAME bound project node — see the note on
  // getCandidatesForProject for why this matters on CognoDB's planner.
  const collabResult = await withSession("read", (tx) =>
    tx.run(
      `MATCH (:Person {id: $personId})-[:WORKED_ON]->(proj:Project)<-[:WORKED_ON]-(collaborator:Person)
       WHERE collaborator.id <> $personId
       RETURN proj.id AS projectId, collaborator {.id, .name, .avatarColor} AS collaborator`,
      { personId }
    )
  );

  const nodes: GraphNode[] = [{ id: `person:${person.id}`, label: person.name, type: "Person", detail: "self" }];
  const links: GraphLink[] = [];

  for (const record of projectsResult.records) {
    const proj = record.get("project") as { id: string; name: string };
    nodes.push({ id: `project:${proj.id}`, label: proj.name, type: "Project" });
    links.push({ source: `person:${person.id}`, target: `project:${proj.id}`, type: "WORKED_ON" });
  }

  const collabLinks = collabResult.records.map((r) => ({
    project: r.get("projectId") as string,
    collaborator: r.get("collaborator") as Record<string, unknown>,
  }));
  for (const entry of collabLinks) {
    const collaborator = entry.collaborator;
    const nodeId = `person:${collaborator.id}`;
    if (!nodes.some((n) => n.id === nodeId)) {
      nodes.push({ id: nodeId, label: collaborator.name as string, type: "Person", detail: "collaborator" });
    }
    links.push({ source: nodeId, target: `project:${entry.project}`, type: "WORKED_ON" });
  }

  return { nodes, links };
}

export async function listPeopleLite(): Promise<PersonSummary[]> {
  const result = await withSession("read", (tx) =>
    tx.run(
      `MATCH (p:Person) RETURN p {.id, .name, .title, .seniority, .location, .avatarColor} AS person ORDER BY p.name`
    )
  );
  return result.records.map((r) => toPersonSummary(r.get("person")));
}

// ---------------------------------------------------------------------------
// Shortest connection path between two people, via WORKED_ON or MENTORED
// edges of either direction, up to 6 hops. A recursive self-join a
// relational schema would need a CTE (and a depth bound) to express at all.
// ---------------------------------------------------------------------------
export async function getConnectionPath(
  fromId: string,
  toId: string
): Promise<{ nodes: GraphNode[]; hops: number } | null> {
  const result = await withSession("read", (tx) =>
    tx.run(
      // Both endpoints are bound by property lookup within this single
      // MATCH pattern (not carried in from a separate earlier clause) —
      // see the note on getCandidatesForProject for why that distinction
      // matters on CognoDB's current query planner.
      `MATCH path = shortestPath(
         (a:Person {id: $fromId})-[:WORKED_ON|MENTORED*1..6]-(b:Person {id: $toId})
       )
       RETURN [n IN nodes(path) | n {.id, .name, labels: labels(n)}] AS nodes, length(path) AS hops`,
      { fromId, toId }
    )
  );

  if (result.records.length === 0) return null;
  const record = result.records[0];
  const rawNodes = record.get("nodes") as { id: string; name: string; labels: string[] }[];

  const nodes: GraphNode[] = rawNodes.map((n) => ({
    id: `${n.labels[0].toLowerCase()}:${n.id}`,
    label: n.name,
    type: n.labels[0] as GraphNode["type"],
  }));

  return { nodes, hops: record.get("hops").toNumber() };
}

// ---------------------------------------------------------------------------
// Bus-factor: skills held by exactly one member of a project's current
// team, plus potential backfill people (found via a variable-length,
// multi-relationship-type walk from the sole skill-holder) who also hold
// the skill at some level.
// ---------------------------------------------------------------------------
export interface BusFactorRisk {
  skillName: string;
  soleHolder: PersonSummary;
  backfillCandidates: (PersonSummary & { level: SkillLevel })[];
}

export async function getBusFactorRisks(projectId: string): Promise<BusFactorRisk[]> {
  const requiredResult = await withSession("read", (tx) =>
    tx.run(`MATCH (:Project {id: $projectId})-[:REQUIRES_SKILL]->(skill:Skill) RETURN skill.name AS name`, {
      projectId,
    })
  );
  const requiredNames = requiredResult.records.map((r) => r.get("name") as string);
  if (requiredNames.length === 0) return [];

  // Single unbroken chain (project -> holder -> skill); filtering by
  // $requiredNames instead of a `(proj)-[:REQUIRES_SKILL]->(skill)`
  // pattern predicate avoids the same planner quirk noted above.
  const holdersResult = await withSession("read", (tx) =>
    tx.run(
      `MATCH (:Project {id: $projectId})<-[:WORKED_ON]-(holder:Person)-[:HAS_SKILL]->(skill:Skill)
       WHERE skill.name IN $requiredNames
       RETURN skill.name AS skillName, holder {.id, .name, .title, .seniority, .location, .avatarColor} AS holder`,
      { projectId, requiredNames }
    )
  );

  const holdersBySkill = new Map<string, Record<string, unknown>[]>();
  for (const record of holdersResult.records) {
    const skillName = record.get("skillName") as string;
    const list = holdersBySkill.get(skillName) ?? [];
    const holder = record.get("holder") as Record<string, unknown>;
    if (!list.some((h) => h.id === holder.id)) list.push(holder);
    holdersBySkill.set(skillName, list);
  }

  const soleHolderSkills = Array.from(holdersBySkill.entries()).filter(([, holders]) => holders.length === 1);

  const risks: BusFactorRisk[] = [];
  for (const [skillName, holders] of soleHolderSkills) {
    const soleHolder = holders[0];

    const backfillResult = await withSession("read", (tx) =>
      tx.run(
        `MATCH (:Person {id: $soleHolderId})-[:WORKED_ON|MENTORED*1..2]-(backfill:Person)-[bhs:HAS_SKILL]->(:Skill {name: $skillName})
         WHERE backfill.id <> $soleHolderId
         RETURN DISTINCT backfill {.id, .name, .title, .seniority, .location, .avatarColor} AS backfill, bhs.level AS level`,
        { soleHolderId: soleHolder.id, skillName }
      )
    );

    risks.push({
      skillName,
      soleHolder: toPersonSummary(soleHolder),
      backfillCandidates: backfillResult.records.map((r) => ({
        ...toPersonSummary(r.get("backfill")),
        level: r.get("level") as SkillLevel,
      })),
    });
  }

  return risks;
}

// ---------------------------------------------------------------------------
// Skill co-occurrence graph for the Explore page: which skills tend to be
// held by the same people, sized by how many people hold each skill.
// ---------------------------------------------------------------------------
export async function getSkillGraph(): Promise<GraphData> {
  const result = await withSession("read", (tx) =>
    tx.run(
      `MATCH (a:Skill)<-[:HAS_SKILL]-(shared:Person)-[:HAS_SKILL]->(b:Skill)
       WHERE a.name < b.name
       WITH a, b, count(DISTINCT shared) AS coHolders
       WHERE coHolders >= 2
       RETURN a {.name, .category} AS skillA, b {.name, .category} AS skillB, coHolders`,
      {}
    )
  );

  const skillHolderCounts = await withSession("read", (tx) =>
    tx.run(`MATCH (s:Skill)<-[:HAS_SKILL]-(p:Person) RETURN s.name AS name, s.category AS category, count(p) AS holders`)
  );

  const nodes: GraphNode[] = skillHolderCounts.records.map((r) => ({
    id: `skill:${r.get("name")}`,
    label: r.get("name"),
    type: "Skill",
    detail: `${r.get("holders").toNumber()} people · ${r.get("category")}`,
  }));

  const links: GraphLink[] = result.records.map((r) => ({
    source: `skill:${r.get("skillA").name}`,
    target: `skill:${r.get("skillB").name}`,
    type: "CO_OCCURS",
    detail: `${r.get("coHolders").toNumber()} shared people`,
  }));

  return { nodes, links };
}

export async function getPeopleForSkill(skillName: string): Promise<(PersonSummary & { level: SkillLevel })[]> {
  const result = await withSession("read", (tx) =>
    tx.run(
      `MATCH (p:Person)-[hs:HAS_SKILL]->(:Skill {name: $skillName})
       RETURN p {.id, .name, .title, .seniority, .location, .avatarColor} AS person, hs.level AS level
       ORDER BY p.name`,
      { skillName }
    )
  );
  return result.records.map((r) => ({ ...toPersonSummary(r.get("person")), level: r.get("level") as SkillLevel }));
}
