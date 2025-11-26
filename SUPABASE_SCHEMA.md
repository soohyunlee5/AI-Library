AI Bookshelf – Supabase Schema (Dummy Backend)

Overview
- Users authenticate with Supabase Auth.
- Each chat belongs to one user and references a single uploaded PDF stored in a bucket named `books`.
- Messages store chat history. The demo API returns an echo-style assistant reply.

Storage
- Bucket: `books`
  - Public: false (recommended); the app reads via signed URLs if needed. For the demo, we only store the path.

SQL (run in Supabase SQL editor)

-- Tables
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  author text,
  file_name text not null,
  file_size bigint not null,
  file_type text not null,
  file_path text, -- path in storage bucket `books`
  position double precision not null default extract(epoch from now()), -- higher = nearer the top of the shelf
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists chats_user_id_created_at_idx on public.chats(user_id, created_at desc);
create index if not exists chats_user_id_position_idx on public.chats(user_id, position asc);
create index if not exists messages_chat_id_created_at_idx on public.messages(chat_id, created_at asc);

-- Row Level Security
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Policies: users can manipulate only their own data
create policy if not exists "chats_select_own" on public.chats for select using (auth.uid() = user_id);
create policy if not exists "chats_modify_own" on public.chats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "chats_delete_own" on public.chats for delete using (auth.uid() = user_id);

create policy if not exists "messages_select_own" on public.messages for select using (
  exists (select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid())
);
create policy if not exists "messages_modify_own" on public.messages for all using (
  exists (select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid())
)
with check (
  exists (select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid())
);

-- Storage policies for bucket `books`
-- Create the bucket in the Storage UI (name: books). Then run:
-- NOTE: If using the Storage V2 policies, adjust syntax accordingly.
-- Allow users to manage files under their own prefix: {user_id}/...
create policy if not exists "books_read_own" on storage.objects for select using (
  bucket_id = 'books' and (auth.role() = 'anon' or auth.role() = 'authenticated') and
  (position(auth.uid()::text || '/' in name) = 1)
);
create policy if not exists "books_write_own" on storage.objects for insert with check (
  bucket_id = 'books' and (position(auth.uid()::text || '/' in name) = 1)
);
create policy if not exists "books_update_own" on storage.objects for update using (
  bucket_id = 'books' and (position(auth.uid()::text || '/' in name) = 1)
);

Seed (optional, for quick testing)
-- Replace 00000000-0000-0000-0000-000000000000 with a real user id
insert into public.chats (user_id, name, file_name, file_size, file_type, file_path)
values (
  '00000000-0000-0000-0000-000000000000',
  'Sample PDF',
  'sample.pdf',
  102400,
  'application/pdf',
  '00000000-0000-0000-0000-000000000000/seed.pdf'
)
returning id;

-- Take the returned chat id and insert a couple of messages
insert into public.messages (chat_id, role, content) values
  ('<CHAT_ID>', 'assistant', 'Welcome to your new chat.'),
  ('<CHAT_ID>', 'user', 'Summarize this PDF');

API Contract (as implemented)
- GET /api/v1/chats → [{ id, name, author, created_at, file_name, file_size, position }]
- GET /api/v1/getHistory/:id → { chat, history: Message[] }
- POST /api/v1/createChat (multipart/form-data: file, name) → { id }
- POST /api/v1/updateChat/:id ({ message }) → { assistant: Message }
- PATCH /api/v1/chats/order ({ ids: string[] }) → 204

Notes
- The “assistant” reply is a dummy echo referencing the uploaded file metadata.
- Files are uploaded to `books/{user_id}/{chat_id}.pdf`.
- This demo assumes RLS policies above are in place.
