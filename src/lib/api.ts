import { NextResponse } from "next/server";
import { DatabaseUnavailableError } from "./neo4j";

export class NotFoundError extends Error {
  constructor(message = "Not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Wraps a route handler body, translating DB failures into a clean JSON error. */
export async function handle<T>(work: () => Promise<T>): Promise<NextResponse> {
  try {
    const data = await work();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof Error && err.name === "MissingConfigError") {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
