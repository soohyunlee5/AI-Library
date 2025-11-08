"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string; created_at?: string };

export default function ChatView({ chatId, initialMessages }: { chatId: string; initialMessages: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function send() {
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    setSending(true);
    try {
      // optimistic
      setMessages((m) => [...m, { id: `tmp_${Date.now()}`, role: "user", content }]);
      const res = await fetch(`/api/v1/updateChat/${chatId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { assistant } = await res.json();
      setMessages((m) => [...m, assistant]);
    } catch (e: any) {
      alert(e?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded border p-3 space-y-3 max-h-[65vh] overflow-auto">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block rounded px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent"}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ask about the PDF..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <Button onClick={send} disabled={sending}>Send</Button>
      </div>
    </div>
  );
}

