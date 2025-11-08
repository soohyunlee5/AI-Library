import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const { data: chat, error } = await supabase
    .from("chats")
    .select("id,name,file_name,file_size,file_type,file_path")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();
  if (error || !chat) return new Response("Not found", { status: 404 });

  const { data: history } = await supabase
    .from("messages")
    .select("id,role,content,created_at")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  return Response.json({ chat, history: history ?? [] });
}
