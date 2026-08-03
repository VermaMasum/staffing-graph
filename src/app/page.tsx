import Link from "next/link";
import { listProjects } from "@/lib/queries";
import { Card, EmptyState, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["staffing", "active", "completed"] as const;
const STATUS_TITLES: Record<(typeof STATUS_ORDER)[number], string> = {
  staffing: "Looking for people",
  active: "In flight",
  completed: "Shipped",
};

export default async function DashboardPage() {
  const projects = await listProjects();

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Run `npm run seed` to load the sample dataset into CognoDB."
      />
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Every project here is a node in the graph — connected to the skills it needs and the people who&apos;ve
          worked on it.
        </p>
      </div>

      {STATUS_ORDER.map((status) => {
        const group = projects.filter((p) => p.status === status);
        if (group.length === 0) return null;
        return (
          <section key={status}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {STATUS_TITLES[status]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="h-full transition hover:border-indigo-300 hover:shadow-sm dark:hover:border-indigo-800">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{project.name}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {project.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{project.domain}</span>
                      <span>·</span>
                      <span>
                        {project.staffedCount} staffed · {project.requiredSkillCount} skills required
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
