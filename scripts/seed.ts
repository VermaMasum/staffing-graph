/**
 * Loads the sample dataset into CognoDB. Safe to re-run: wipes the graph
 * first, then rebuilds it from scratch via parameterized Cypher.
 *
 * Usage: npm run seed
 */
import { config } from "dotenv";
import neo4j from "neo4j-driver";

config({ path: ".env.local" });
import { skills } from "./data/skills";
import { teams } from "./data/teams";
import { people } from "./data/people";
import { projects } from "./data/projects";
import { mentorships } from "./data/mentorships";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in your CognoDB Cloud credentials.`
    );
  }
  return value;
}

async function main() {
  const uri = requireEnv("NEO4J_URI");
  const username = requireEnv("NEO4J_USERNAME");
  const password = requireEnv("NEO4J_PASSWORD");

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

  try {
    await driver.verifyConnectivity();
    console.log("Connected to CognoDB.");
  } catch (err) {
    console.error("Could not connect to CognoDB. Check your .env.local credentials.");
    throw err;
  }

  const session = driver.session();

  try {
    console.log("Applying uniqueness constraints...");
    for (const stmt of [
      "CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT team_id IF NOT EXISTS FOR (t:Team) REQUIRE t.id IS UNIQUE",
      "CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE",
    ]) {
      try {
        await session.run(stmt);
      } catch (err) {
        console.warn(`  (skipped constraint: ${(err as Error).message})`);
      }
    }

    console.log("Clearing existing graph...");
    await session.run("MATCH (n) DETACH DELETE n");

    console.log(`Loading ${skills.length} skills...`);
    await session.run(
      `UNWIND $skills AS skill
       MERGE (s:Skill {name: skill.name})
       SET s.category = skill.category`,
      { skills }
    );

    console.log(`Loading ${teams.length} teams...`);
    await session.run(
      `UNWIND $teams AS team
       MERGE (t:Team {id: team.id})
       SET t.name = team.name`,
      { teams }
    );

    console.log(`Loading ${people.length} people...`);
    await session.run(
      `UNWIND $people AS person
       MERGE (p:Person {id: person.id})
       SET p.name = person.name,
           p.title = person.title,
           p.seniority = person.seniority,
           p.location = person.location,
           p.bio = person.bio,
           p.avatarColor = person.avatarColor
       WITH p, person
       MATCH (t:Team {id: person.teamId})
       MERGE (p)-[:MEMBER_OF]->(t)`,
      { people }
    );

    const personSkills = people.flatMap((person) =>
      person.skills.map((skill) => ({
        personId: person.id,
        skillName: skill.name,
        level: skill.level,
        years: skill.years,
      }))
    );
    console.log(`Loading ${personSkills.length} HAS_SKILL relationships...`);
    await session.run(
      `UNWIND $personSkills AS ps
       MATCH (p:Person {id: ps.personId}), (s:Skill {name: ps.skillName})
       MERGE (p)-[r:HAS_SKILL]->(s)
       SET r.level = ps.level, r.years = ps.years`,
      { personSkills }
    );

    console.log(`Loading ${projects.length} projects...`);
    await session.run(
      `UNWIND $projects AS proj
       MERGE (pr:Project {id: proj.id})
       SET pr.name = proj.name,
           pr.description = proj.description,
           pr.domain = proj.domain,
           pr.status = proj.status`,
      { projects: projects.map(({ id, name, description, domain, status }) => ({ id, name, description, domain, status })) }
    );

    const requiredSkills = projects.flatMap((project) =>
      project.requiredSkills.map((rs) => ({
        projectId: project.id,
        skillName: rs.name,
        minLevel: rs.minLevel,
      }))
    );
    console.log(`Loading ${requiredSkills.length} REQUIRES_SKILL relationships...`);
    await session.run(
      `UNWIND $requiredSkills AS rs
       MATCH (pr:Project {id: rs.projectId}), (s:Skill {name: rs.skillName})
       MERGE (pr)-[r:REQUIRES_SKILL]->(s)
       SET r.minLevel = rs.minLevel`,
      { requiredSkills }
    );

    const roster = projects.flatMap((project) =>
      project.roster.map((entry) => ({
        projectId: project.id,
        personId: entry.personId,
        role: entry.role,
        start: entry.start,
        end: entry.end,
      }))
    );
    console.log(`Loading ${roster.length} WORKED_ON relationships...`);
    await session.run(
      `UNWIND $roster AS w
       MATCH (p:Person {id: w.personId}), (pr:Project {id: w.projectId})
       MERGE (p)-[r:WORKED_ON]->(pr)
       SET r.role = w.role,
           r.start = w.start,
           r.end = w.end`,
      { roster }
    );

    console.log(`Loading ${mentorships.length} MENTORED relationships...`);
    await session.run(
      `UNWIND $mentorships AS m
       MATCH (mentor:Person {id: m.mentorId}), (mentee:Person {id: m.menteeId})
       MERGE (mentor)-[r:MENTORED]->(mentee)
       SET r.skill = m.skill`,
      { mentorships }
    );

    const summary = await session.run(
      `MATCH (n) RETURN labels(n)[0] AS label, count(*) AS count ORDER BY label`
    );
    console.log("\nSeed complete. Node counts:");
    for (const record of summary.records) {
      console.log(`  ${record.get("label")}: ${record.get("count").toNumber()}`);
    }
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
