import { notFound } from "next/navigation";
import { getPersonDetail } from "@/lib/queries";
import { Card, PersonAvatar, SkillPill } from "@/components/ui";
import PersonNetwork from "@/components/PersonNetwork";
import ConnectionFinder from "@/components/ConnectionFinder";

export const dynamic = "force-dynamic";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPersonDetail(id);
  if (!person) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <PersonAvatar person={person} size={56} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{person.name}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {person.title} · {person.seniority} · {person.location}
          </p>
        </div>
      </div>

      <Card>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{person.bio}</p>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {person.skills.length === 0 ? (
            <p className="text-sm text-neutral-400">No skills recorded.</p>
          ) : (
            person.skills.map((s) => <SkillPill key={s.name} name={s.name} level={s.level} />)
          )}
        </div>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Collaboration network</h2>
        <PersonNetwork personId={person.id} />
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">How am I connected to...?</h2>
        <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
          Shortest path through shared projects and mentorships — a graph-native question a relational join table
          would need a recursive CTE to answer at all.
        </p>
        <ConnectionFinder fromId={person.id} />
      </section>
    </div>
  );
}
