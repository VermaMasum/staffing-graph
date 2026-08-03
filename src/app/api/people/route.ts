import { handle } from "@/lib/api";
import { listPeopleLite } from "@/lib/queries";

export async function GET() {
  return handle(() => listPeopleLite());
}
