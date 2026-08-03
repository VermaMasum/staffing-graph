import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { getCandidatesForProject, getProjectNeighborhood } from "@/lib/queries";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/projects/[id]/candidates">) {
  const { id } = await ctx.params;
  return handle(async () => {
    const candidates = await getCandidatesForProject(id);
    const topIds = candidates.slice(0, 8).map((c) => c.person.id);
    const graph = await getProjectNeighborhood(id, topIds);
    return { candidates, graph };
  });
}
