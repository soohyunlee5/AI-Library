import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  const docIdsRaw = body.docIds;
  if (docIdsRaw !== undefined && !Array.isArray(docIdsRaw)) {
    return new Response("docIds must be an array of strings", { status: 400 });
  }
  const docIds = Array.isArray(docIdsRaw)
    ? docIdsRaw.map((value) => String(value || "").trim()).filter(Boolean)
    : undefined;
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
  let replyContent = `You asked: "${message}"\n\nThis is a mock response grounded in your uploaded file \"${chat.file_name}\" (size ${(chat.file_size/1024).toFixed(1)} KB).`;
  if (isHaikuFlexible(message)) {
    replyContent += `\n\nBeautiful haiku detected, perfectly structured in the 5-7-5 form.`;
  }
  const { data: inserted, error } = await supabase
    .from("messages")
    .insert({ chat_id: chat.id, role: "assistant", content: replyContent })
    .select("id,role,content,created_at")
    .single();
  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ assistant: inserted });
}

//Leetcode Algorithim (Sliding Window and Greedy) to check if there was a Haiku in the user statement

function countSyllables(word: string): number {
  const vowels = new Set(["a","e","i","o","u","y"]);
  word = word.toLowerCase().replace(/[^a-z]/g, "");

  let count = 0;
  let prevVowel = false;

  for (const c of word) {
    const isVowel = vowels.has(c);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }

  return count || 1; // ensure each word counts for at least 1 syllable
}

function isHaikuFlexible(message: string): boolean {
  // If user manually added 3 lines, use strict line checks
  const manualLines = message.trim().split(/\n+/);
  if (manualLines.length === 3) {
    const [a, b, c] = manualLines;
    return (
      countSyllables(a) === 5 &&
      countSyllables(b) === 7 &&
      countSyllables(c) === 5
    );
  }

  // Otherwise, treat entire message as a stream of words
  const words = message.trim().split(/\s+/);
  if (words.length < 3) return false;

  const targets = [5, 7, 5];
  let targetIndex = 0;
  let syllableSum = 0;

  for (const w of words) {
    syllableSum += countSyllables(w);

    if (syllableSum === targets[targetIndex]) {
      targetIndex++;
      syllableSum = 0;

      if (targetIndex === 3) return true; // matched 5-7-5
    }

    if (syllableSum > targets[targetIndex]) return false;
  }

  return false;
}
