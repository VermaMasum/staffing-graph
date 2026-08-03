"use client";

import { useEffect, useState } from "react";
import { Card, PersonAvatar, PersonRow, Skeleton, SkillPill } from "@/components/ui";
import type { BusFactorRisk } from "@/lib/queries";

export default function ProjectBusFactor({ projectId }: { projectId: string }) {
  const [risks, setRisks] = useState<BusFactorRisk[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${projectId}/bus-factor`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load.");
        return res.json();
      })
      .then((data) => !cancelled && setRisks(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (error) return null; // non-critical panel; fail quietly rather than blocking the page
  if (!risks) return <Skeleton className="h-32 rounded-xl" />;
  if (risks.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Bus-factor risk</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Required skills held by exactly one person on this team, with backfill candidates found by walking their
          collaboration and mentorship history.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {risks.map((risk) => (
          <Card key={risk.skillName}>
            <div className="flex items-center gap-2">
              <SkillPill name={risk.skillName} />
              <span className="text-xs text-neutral-400">single point of failure</span>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Sole holder</p>
              <PersonRow person={risk.soleHolder} />
            </div>
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                Possible backfill
              </p>
              {risk.backfillCandidates.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No one within 2 hops of {risk.soleHolder.name.split(" ")[0]} currently holds this skill.
                </p>
              ) : (
                <div className="space-y-1">
                  {risk.backfillCandidates.map((b) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <PersonAvatar person={b} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-neutral-800 dark:text-neutral-200">{b.name}</p>
                      </div>
                      <SkillPill name={risk.skillName} level={b.level} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
