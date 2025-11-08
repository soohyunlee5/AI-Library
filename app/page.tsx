import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewChatForm from "@/components/bookshelf/new-chat-form";
import ChatList from "@/components/bookshelf/chat-list";
import { AuthButton } from "@/components/auth-button";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/login");

  return (
    <main className="mx-auto max-w-4xl p-6 flex flex-col gap-6">
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="font-bold text-2xl">AI Bookshelf</h1>
        <AuthButton />
      </header>
      <section>
        <NewChatForm />
      </section>
      <section>
        <h2 className="font-semibold mb-2">Your Chats</h2>
        <ChatList />
      </section>
    </main>
  );
}
