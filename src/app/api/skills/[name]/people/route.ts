import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { getPeopleForSkill } from "@/lib/queries";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/skills/[name]/people">) {
  const { name } = await ctx.params;
  return handle(() => getPeopleForSkill(decodeURIComponent(name)));
}
