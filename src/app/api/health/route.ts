export async function GET(): Promise<Response> {
  // Liveness only: database readiness is deliberately not implied.
  return Response.json(
    { status: "ok" },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
