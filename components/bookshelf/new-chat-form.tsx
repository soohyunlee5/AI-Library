"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function NewChatForm() {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file");
    const fd = new FormData();
    fd.append("name", name || file.name.replace(/\.pdf$/i, ""));
    fd.append("file", file);
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/createChat", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/chat/${data.id}`);
    } catch (err: any) {
      alert(err?.message || "Failed to create chat");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a new chat</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Chat name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button type="submit" disabled={isLoading || !file}>
            {isLoading ? "Creating..." : "Create chat from PDF"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

