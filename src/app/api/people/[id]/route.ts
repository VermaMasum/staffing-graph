import { NextRequest } from "next/server";
import { handle, NotFoundError } from "@/lib/api";
import { getPersonDetail } from "@/lib/queries";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/people/[id]">) {
  const { id } = await ctx.params;
  return handle(async () => {
    const person = await getPersonDetail(id);
    if (!person) throw new NotFoundError("Person not found.");
    return person;
  });
}
