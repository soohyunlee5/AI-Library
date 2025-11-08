import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatView from "@/components/bookshelf/chat-view";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/auth/login");

  const { data: chat } = await supabase
    .from("chats")
    .select("id,name,file_name,file_size,file_type,file_path")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();
  if (!chat) redirect("/");

  const { data: messages } = await supabase
    .from("messages")
    .select("id,role,content,created_at")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl p-6 flex flex-col gap-4">
      <h1 className="font-semibold text-xl">{chat.name}</h1>
      <ChatView chatId={id} initialMessages={messages ?? []} />
    </main>
  );
}
