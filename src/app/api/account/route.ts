import { createClient } from "@supabase/supabase-js";
import { authenticatedUser } from "@/lib/server-auth";
export async function DELETE(request: Request) {
  const user = await authenticatedUser(request);
  if (!user)
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  if (request.headers.get("x-confirm-delete") !== "delete-my-account")
    return Response.json(
      { error: "Deletion must be explicitly confirmed." },
      { status: 400 },
    );
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret)
    return Response.json(
      {
        error: "Account deletion is not configured. Contact the site operator.",
      },
      { status: 503 },
    );
  const admin = createClient(url, secret, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  return error
    ? Response.json(
        { error: "Account deletion could not be completed. Please try again." },
        { status: 503 },
      )
    : Response.json({ deleted: true });
}
