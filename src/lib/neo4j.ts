import neo4j, { Driver, ManagedTransaction, Session } from "neo4j-driver";

class MissingConfigError extends Error {
  constructor(missing: string[]) {
    super(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in your CognoDB Cloud connection details."
    );
    this.name = "MissingConfigError";
  }
}

function readConfig() {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  const missing = [
    !uri && "NEO4J_URI",
    !username && "NEO4J_USERNAME",
    !password && "NEO4J_PASSWORD",
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    throw new MissingConfigError(missing);
  }

  return { uri: uri!, username: username!, password: password! };
}

// Reuse a single driver instance across hot reloads in dev and across
// invocations in serverless/edge runtimes.
const globalForDriver = globalThis as unknown as { __neo4jDriver?: Driver };

function getDriver(): Driver {
  if (globalForDriver.__neo4jDriver) {
    return globalForDriver.__neo4jDriver;
  }

  const { uri, username, password } = readConfig();

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    maxConnectionPoolSize: 20,
    connectionAcquisitionTimeout: 10_000,
    connectionTimeout: 10_000,
  });

  globalForDriver.__neo4jDriver = driver;
  return driver;
}

export class DatabaseUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Could not reach the graph database. It may be unreachable or misconfigured.");
    this.name = "DatabaseUnavailableError";
    this.cause = cause;
  }
}

/**
 * Runs `work` inside a session, translating driver/connectivity failures
 * into a single well-known error type the API layer can catch.
 */
export async function withSession<T>(
  mode: "read" | "write",
  work: (tx: ManagedTransaction) => Promise<T>
): Promise<T> {
  let driver: Driver;
  try {
    driver = getDriver();
  } catch (err) {
    if (err instanceof MissingConfigError) throw err;
    throw new DatabaseUnavailableError(err);
  }

  const session: Session = driver.session({
    defaultAccessMode: mode === "read" ? neo4j.session.READ : neo4j.session.WRITE,
  });

  try {
    return mode === "read"
      ? await session.executeRead(work)
      : await session.executeWrite(work);
  } catch (err) {
    if (err instanceof MissingConfigError) throw err;
    throw new DatabaseUnavailableError(err);
  } finally {
    await session.close();
  }
}

export async function checkHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    const driver = getDriver();
    await driver.verifyConnectivity();
    return { ok: true, message: "Connected to CognoDB." };
  } catch (err) {
    const message =
      err instanceof MissingConfigError
        ? err.message
        : "Could not reach the graph database.";
    return { ok: false, message };
  }
}

export { neo4j };
