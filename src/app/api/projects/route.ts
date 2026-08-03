import { handle } from "@/lib/api";
import { listProjects } from "@/lib/queries";

export async function GET() {
  return handle(() => listProjects());
}
