"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Skeleton } from "@/components/ui";
import type { GraphNode, PersonSummary } from "@/lib/types";

export default function ConnectionFinder({ fromId }: { fromId: string }) {
  const [people, setPeople] = useState<PersonSummary[] | null>(null);
  const [targetId, setTargetId] = useState<string>("");
  const [path, setPath] = useState<{ nodes: GraphNode[]; hops: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/people")
      .then((res) => res.json())
      .then((data: PersonSummary[]) => setPeople(data.filter((p) => p.id !== fromId)));
  }, [fromId]);

  useEffect(() => {
    if (!targetId) {
      setPath(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/people/${fromId}/path?to=${targetId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "No path found.");
        return res.json();
      })
      .then((data) => !cancelled && setPath(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fromId, targetId]);

  if (!people) return <Skeleton className="h-20 rounded-xl" />;

  return (
    <Card>
      <select
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        className="w-full max-w-sm rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">Pick a colleague...</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.title}
          </option>
        ))}
      </select>

      {loading && <p className="mt-3 text-sm text-neutral-400">Searching...</p>}
      {error && <p className="mt-3 text-sm text-neutral-400">{error}</p>}

      {path && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {path.nodes.map((node, i) => (
            <div key={node.id} className="flex items-center gap-2">
              {node.type === "Person" ? (
                <Link
                  href={`/people/${node.id.replace("person:", "")}`}
                  className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300"
                >
                  {node.label}
                </Link>
              ) : (
                <Link
                  href={`/projects/${node.id.replace("project:", "")}`}
                  className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300"
                >
                  {node.label}
                </Link>
              )}
              {i < path.nodes.length - 1 && <span className="text-neutral-300">→</span>}
            </div>
          ))}
          <span className="ml-2 text-xs text-neutral-400">({path.hops} hops)</span>
        </div>
      )}
    </Card>
  );
}
