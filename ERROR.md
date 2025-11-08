 GET /chat/35dc4b8d-0ab4-4662-98bd-9796040192b3 200 in 3.0s (compile: 2.3s, proxy.ts: 197ms, render: 465ms)
Error: Route "/api/v1/updateChat/[id]" used `params.id`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at POST (app\api\v1\updateChat\[id]\route.ts:18:22)
  16 |     .from("chats")
  17 |     .select("id,name,file_name,file_size")
> 18 |     .eq("id", params.id)
     |                      ^
  19 |     .eq("user_id", auth.user.id)
  20 |     .single();
  21 |   if (!chat) return new Response("Not found", { status: 404 });