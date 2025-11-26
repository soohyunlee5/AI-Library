import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const author = body.author === undefined || body.author === null ? null : String(body.author || "").trim();

  if (!title) return new Response("title is required", { status: 400 });

  const updatePayload: Record<string, string | null> = { name: title };
  if (author !== null) {
    updatePayload.author = author || null;
  }

  const { data, error } = await supabase
    .from("chats")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select("id,name,author,file_name,file_size,created_at,position")
    .single();

  // If the update failed (e.g., missing column), retry with name only
  if (error) {
    const { data: nameOnlyData, error: nameOnlyError } = await supabase
      .from("chats")
      .update({ name: title })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id,name,file_name,file_size,created_at,position")
      .single();
    if (nameOnlyError) return new Response(nameOnlyError.message, { status: 500 });
    return Response.json({ chat: nameOnlyData, warning: "Saved title only; author column may be missing" });
  }

  return Response.json({ chat: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const uuidRegex = /^[0-9a-fA-F-]{36}$/;
  if (!uuidRegex.test(id)) return new Response("Bad id", { status: 400 });

  // Fetch the chat to confirm ownership and get file path
  let chat: { id: string; user_id: string; file_path?: string | null } | null = null;
  const { data: chatData, error: chatErr } = await supabase
    .from("chats")
    .select("id,user_id,file_path")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();

  if (chatErr && /file_path/.test(chatErr.message)) {
    // Fallback if file_path column is missing
    const { data: fallbackChat, error: fallbackErr } = await supabase
      .from("chats")
      .select("id,user_id")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .single();
    if (fallbackErr || !fallbackChat) {
      return new Response(fallbackErr?.message || "Not found", { status: 404 });
    }
    chat = fallbackChat;
  } else if (chatErr || !chatData) {
    return new Response(chatErr?.message || "Not found", { status: 404 });
  } else {
    chat = chatData;
  }

  // Delete storage object if present
  if (chat.file_path) {
    const { error: storageErr } = await supabase.storage.from("books").remove([chat.file_path]);
    if (storageErr) {
      console.warn(`Failed to remove storage object ${chat.file_path}:`, storageErr.message);
    }
  }

  // Delete the chat row (messages cascade via FK)
  const { error: deleteErr } = await supabase.from("chats").delete().eq("id", chat.id).eq("user_id", auth.user.id);
  if (deleteErr) return new Response(deleteErr.message, { status: 500 });

  return new Response(null, { status: 204 });
}
