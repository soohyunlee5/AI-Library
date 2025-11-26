import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const { data, error } = await supabase
    .from("chats")
    .select("id,name,author,created_at,file_name,file_size,position")
    .eq("user_id", auth.user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data ?? []);
}
