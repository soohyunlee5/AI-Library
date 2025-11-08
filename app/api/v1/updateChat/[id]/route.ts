import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  if (!message) return new Response("message is required", { status: 400 });

  // Ensure chat belongs to user
  const { data: chat } = await supabase
    .from("chats")
    .select("id,name,file_name,file_size")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();
  if (!chat) return new Response("Not found", { status: 404 });

  // Insert user message
  await supabase.from("messages").insert({ chat_id: chat.id, role: "user", content: message });

  // Dummy assistant reply
  const replyContent = `You asked: "${message}"\n\nThis is a mock response grounded in your uploaded file \"${chat.file_name}\" (size ${(chat.file_size/1024).toFixed(1)} KB).`;
  const { data: inserted, error } = await supabase
    .from("messages")
    .insert({ chat_id: chat.id, role: "assistant", content: replyContent })
    .select("id,role,content,created_at")
    .single();
  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ assistant: inserted });
}
