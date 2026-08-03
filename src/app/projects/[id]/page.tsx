import { notFound } from "next/navigation";
import { getProjectDetail } from "@/lib/queries";
import { Card, PersonRow, SkillPill, StatusBadge } from "@/components/ui";
import ProjectCandidates from "@/components/ProjectCandidates";
import ProjectBusFactor from "@/components/ProjectBusFactor";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">{project.description}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-neutral-400">{project.domain}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Required skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.requiredSkills.length === 0 ? (
              <p className="text-sm text-neutral-400">No specific skills recorded for this project.</p>
            ) : (
              project.requiredSkills.map((s) => <SkillPill key={s.name} name={s.name} level={s.minLevel} />)
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Current team ({project.team.length})
          </h2>
          <div className="mt-3 space-y-1">
            {project.team.length === 0 ? (
              <p className="text-sm text-neutral-400">Nobody staffed yet.</p>
            ) : (
              project.team.map((t) => <PersonRow key={t.person.id} person={t.person} subtitle={t.role} />)
            )}
          </div>
        </Card>
      </div>

      {project.status === "staffing" && <ProjectCandidates projectId={project.id} />}

      {(project.status === "active" || project.status === "completed") && (
        <ProjectBusFactor projectId={project.id} />
      )}
    </div>
  );
}
