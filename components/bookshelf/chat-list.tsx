import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ChatList() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("chats")
    .select("id,name,created_at,file_name,file_size")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error) {
    return <p className="text-sm text-muted-foreground">Failed to load chats.</p>;
  }
  const chats = data ?? [];
  if (!chats.length) return <p className="text-sm text-muted-foreground">No chats yet.</p>;

  return (
    <ul className="divide-y rounded-md border">
      {chats.map((c) => (
        <li key={c.id} className="p-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.file_name} • {(c.file_size/1024).toFixed(1)} KB</div>
          </div>
          <Link className="text-sm underline" href={`/chat/${c.id}`}>Open</Link>
        </li>
      ))}
    </ul>
  );
}
