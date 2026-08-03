import { NextRequest } from "next/server";
import { handle, NotFoundError } from "@/lib/api";
import { getConnectionPath } from "@/lib/queries";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/people/[id]/path">) {
  const { id } = await ctx.params;
  const to = req.nextUrl.searchParams.get("to");

  return handle(async () => {
    if (!to) throw new NotFoundError("Missing ?to= target person id.");
    const path = await getConnectionPath(id, to);
    if (!path) throw new NotFoundError("No connection path found within 6 hops.");
    return path;
  });
}
