import { sql } from "drizzle-orm";
import { getDb } from "@/db";
export async function GET() {
  if (!process.env.DATABASE_URL)
    return Response.json(
      { status: "not_configured", db: "not_configured" },
      { status: 503 },
    );
  try {
    await getDb().execute(sql`select 1`);
    return Response.json(
      { status: "ok", db: "connected" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable", db: "unavailable" },
      { status: 503 },
    );
  }
}
