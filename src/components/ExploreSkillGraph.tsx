"use client";

import { useEffect, useState } from "react";
import GraphView from "@/components/GraphView";
import { Card, EmptyState, ErrorState, PersonAvatar, Skeleton } from "@/components/ui";
import type { GraphData, GraphNode, PersonSummary, SkillLevel } from "@/lib/types";

export default function ExploreSkillGraph() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [people, setPeople] = useState<(PersonSummary & { level: SkillLevel })[] | null>(null);

  useEffect(() => {
    fetch("/api/skills/graph")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load skill graph.");
        return res.json();
      })
      .then(setGraph)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedSkill) return;
    setPeople(null);
    fetch(`/api/skills/${encodeURIComponent(selectedSkill)}/people`)
      .then((res) => res.json())
      .then(setPeople);
  }, [selectedSkill]);

  if (error) return <ErrorState message={error} />;
  if (!graph) return <Skeleton className="h-[480px] rounded-xl" />;
  if (graph.nodes.length === 0) {
    return <EmptyState title="No skill data yet" description="Run `npm run seed` to load the sample dataset." />;
  }

  const handleNodeClick = (node: GraphNode) => setSelectedSkill(node.label);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <GraphView data={graph} onNodeClick={handleNodeClick} height={520} />
      </div>
      <Card>
        {!selectedSkill ? (
          <p className="text-sm text-neutral-400">Click a skill node to see who holds it.</p>
        ) : (
          <>
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{selectedSkill}</h3>
            {!people ? (
              <div className="mt-3 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 rounded-md" />
                ))}
              </div>
            ) : people.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-400">Nobody holds this skill.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {people.map((p) => (
                  <a
                    key={p.id}
                    href={`/people/${p.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    <PersonAvatar person={p} size={30} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {p.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{p.level}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
