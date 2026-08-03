"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GraphView from "@/components/GraphView";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import type { GraphData, GraphNode } from "@/lib/types";

export default function PersonNetwork({ personId }: { personId: string }) {
  const router = useRouter();
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setGraph(null);
    setError(null);
    fetch(`/api/people/${personId}/network`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load network.");
        return res.json();
      })
      .then((data) => !cancelled && setGraph(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [personId]);

  if (error) return <ErrorState message={error} />;
  if (!graph) return <Skeleton className="h-96 rounded-xl" />;
  if (graph.nodes.length <= 1) return <EmptyState title="No project history yet" />;

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === "Person" && node.detail !== "self") {
      router.push(`/people/${node.id.replace("person:", "")}`);
    } else if (node.type === "Project") {
      router.push(`/projects/${node.id.replace("project:", "")}`);
    }
  };

  return <GraphView data={graph} onNodeClick={handleNodeClick} height={420} />;
}
