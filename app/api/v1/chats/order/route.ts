import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map((id: unknown) => String(id || "").trim()).filter(Boolean) : null;
  if (!ids || ids.length === 0) return new Response("ids is required", { status: 400 });

  // Ensure ids are unique to avoid duplicate positions
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) return new Response("ids must be unique", { status: 400 });
    seen.add(id);
  }

  // Verify ownership
  const { data: owned, error: fetchErr } = await supabase
    .from("chats")
    .select("id")
    .eq("user_id", auth.user.id)
    .in("id", ids);
  if (fetchErr) return new Response(fetchErr.message, { status: 500 });
  const ownedIds = new Set((owned ?? []).map((row) => row.id));
  if (ownedIds.size !== ids.length) return new Response("Some ids are invalid", { status: 400 });

  // Assign positions in the order provided (lower index = lower on the shelf data array)
  for (let index = 0; index < ids.length; index++) {
    const id = ids[index];
    const { error: updateErr } = await supabase
      .from("chats")
      .update({ position: index })
      .eq("id", id)
      .eq("user_id", auth.user.id);
    if (updateErr) return new Response(updateErr.message, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
