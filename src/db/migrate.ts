import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getDb, closeDb } from "./index";
async function run() {
  try {
    await migrate(getDb(), { migrationsFolder: "./drizzle" });
    console.info("Database migrations applied.");
  } catch {
    console.error(
      "Migration failed. Check the server-only DATABASE_URL and Supabase database permissions.",
    );
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}
void run();
