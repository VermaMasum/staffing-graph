import { NextRequest } from "next/server";
import { handle, NotFoundError } from "@/lib/api";
import { getProjectDetail } from "@/lib/queries";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  return handle(async () => {
    const project = await getProjectDetail(id);
    if (!project) throw new NotFoundError("Project not found.");
    return project;
  });
}
