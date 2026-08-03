"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GraphView from "@/components/GraphView";
import { Card, EmptyState, ErrorState, PersonAvatar, Skeleton, SkillPill } from "@/components/ui";
import type { CandidateMatch, GraphData, GraphNode } from "@/lib/types";

export default function ProjectCandidates({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateMatch[] | null>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCandidates(null);
    setError(null);

    fetch(`/api/projects/${projectId}/candidates`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load candidates.");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setCandidates(data.candidates);
        setGraph(data.graph);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (error) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold">Find candidates</h2>
        <ErrorState message={error} />
      </section>
    );
  }

  if (!candidates) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold">Find candidates</h2>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === "Person") router.push(`/people/${node.id.replace("person:", "")}`);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Find candidates</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Ranked by required-skill overlap and prior collaboration with the people already on this project.
        </p>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="No candidates found"
          description="Nobody in the graph currently holds any of the required skills."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-3">
            {candidates.slice(0, 8).map((c, i) => (
              <CandidateCard key={c.person.id} candidate={c} rank={i + 1} />
            ))}
          </div>
          <div className="lg:col-span-2">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Project neighborhood
            </p>
            {graph && <GraphView data={graph} onNodeClick={handleNodeClick} height={480} />}
          </div>
        </div>
      )}
    </section>
  );
}

function CandidateCard({ candidate, rank }: { candidate: CandidateMatch; rank: number }) {
  const pct = Math.round(candidate.totalScore * 100);
  return (
    <a
      href={`/people/${candidate.person.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-indigo-800"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          {rank}
        </span>
        <PersonAvatar person={candidate.person} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{candidate.person.name}</p>
            <span className="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{pct}% match</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {candidate.person.title} · {candidate.person.location}
          </p>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {candidate.matchedSkills.map((s) => (
              <SkillPill key={s.name} name={s.name} level={s.level} muted={!s.meetsMinLevel} />
            ))}
            {candidate.missingSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full border border-dashed border-neutral-300 px-2.5 py-0.5 text-xs text-neutral-400 dark:border-neutral-700"
              >
                missing {s}
              </span>
            ))}
          </div>

          {candidate.collaborators.length > 0 && (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Worked before with{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {candidate.collaborators.map((c) => c.person.name).join(", ")}
              </span>
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
