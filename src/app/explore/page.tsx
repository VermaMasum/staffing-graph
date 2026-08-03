import ExploreSkillGraph from "@/components/ExploreSkillGraph";

export default function ExplorePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Explore skills</h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
          Skills connected here are held by the same people — click a skill to see who, or a cluster to spot
          adjacent skillsets across the org.
        </p>
      </div>
      <ExploreSkillGraph />
    </div>
  );
}
