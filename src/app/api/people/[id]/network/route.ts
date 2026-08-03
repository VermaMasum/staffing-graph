import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { getPersonNetwork } from "@/lib/queries";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/people/[id]/network">) {
  const { id } = await ctx.params;
  return handle(() => getPersonNetwork(id));
}
