import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const name = String(form.get("name") || "Untitled Chat");
  if (!(file instanceof File)) return new Response("file is required", { status: 400 });
  if (file.type !== "application/pdf") return new Response("Only PDF accepted", { status: 400 });
  if (file.size > 10 * 1024 * 1024) return new Response("Max file size is 10MB", { status: 400 });

  // create chat row first to get id
  const { data: chatRow, error: chatErr } = await supabase
    .from("chats")
    .insert({ user_id: auth.user.id, name, file_name: file.name, file_size: file.size, file_type: file.type })
    .select("id")
    .single();
  if (chatErr || !chatRow) return new Response(chatErr?.message || "Insert failed", { status: 500 });

  const path = `${auth.user.id}/${chatRow.id}.pdf`;
  const { error: upErr } = await supabase.storage.from("books").upload(path, file, { contentType: file.type, upsert: true });
  if (upErr) return new Response(upErr.message, { status: 500 });

  await supabase.from("chats").update({ file_path: path }).eq("id", chatRow.id);

  // seed a system/assistant welcome message
  const welcome = `New chat created for \"${file.name}\". Ask anything about this PDF!`;
  await supabase.from("messages").insert({ chat_id: chatRow.id, role: "assistant", content: welcome });

  return Response.json({ id: chatRow.id });
}
