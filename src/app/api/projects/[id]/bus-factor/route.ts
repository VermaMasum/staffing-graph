import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { getBusFactorRisks } from "@/lib/queries";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/projects/[id]/bus-factor">) {
  const { id } = await ctx.params;
  return handle(() => getBusFactorRisks(id));
}
