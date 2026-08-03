import { handle } from "@/lib/api";
import { getSkillGraph } from "@/lib/queries";

export async function GET() {
  return handle(() => getSkillGraph());
}
