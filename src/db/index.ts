import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;
type DatabaseCache = { pool?: Pool; db?: Database };

const globalDatabase = globalThis as typeof globalThis & {
  englishPracticeDatabase?: DatabaseCache;
};

function getCache(): DatabaseCache {
  if (typeof window !== "undefined") {
    throw new Error("The database client must only run on the server.");
  }
  globalDatabase.englishPracticeDatabase ??= {};
  return globalDatabase.englishPracticeDatabase;
}

// Lazy initialisation allows static pages to build without database credentials.
// A privileged connection may bypass RLS. Future APIs must authenticate users
// and use a non-bypass role with transaction-local JWT claims for RLS access.
export function getDb(): Database {
  const cache = getCache();
  if (cache.db) return cache.db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required for server-side database access.",
    );
  }

  cache.pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  cache.db = drizzle(cache.pool, { schema });
  return cache.db;
}

// Used by standalone scripts, not by individual HTTP requests.
export async function closeDb(): Promise<void> {
  const cache = getCache();
  const pool = cache.pool;
  delete cache.db;
  delete cache.pool;
  if (pool) await pool.end();
}
