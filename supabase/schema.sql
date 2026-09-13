-- Run this once in Supabase: Project > SQL Editor > New query > paste > Run

create extension if not exists vector;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text,
  created_at timestamptz default now()
);

-- Storage bucket for the original uploaded PDF of each document (used by the
-- "preview" eye icon) — create this via the Storage API or dashboard, NOT
-- SQL: `insert into storage.buckets ...` looks like it should work but is
-- silently ineffective on Supabase's hosted platform (confirmed: the insert
-- runs without error, but the bucket never actually exists — uploads then
-- fail with "Bucket not found"). Either:
--   - Dashboard: Storage → New bucket → name it "documents" → Private, or
--   - Run once: node -e "require('@supabase/supabase-js').createClient(URL, SERVICE_ROLE_KEY).storage.createBucket('documents', { public: false })"
-- Private, not public — the server generates a short-lived signed URL on
-- demand via the service_role key rather than exposing every uploaded file
-- at a permanent public URL.

create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  chunk_index int not null,
  embedding vector(768),
  created_at timestamptz default now()
);

-- RLS with no policies: denies all access via the public REST API (anon/authenticated
-- roles), while the server-side service_role key (the only key this app uses) bypasses
-- RLS entirely and keeps working. These tables should never be touched from the client.
alter table documents enable row level security;
alter table chunks enable row level security;

-- Similarity search function: returns the top N most relevant chunks for a query embedding
create or replace function match_chunks (
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  filename text,
  similarity float
)
language sql stable
as $$
  select
    chunks.id,
    chunks.document_id,
    chunks.content,
    chunks.chunk_index,
    documents.filename,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  join documents on documents.id = chunks.document_id
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- Index for faster similarity search. HNSW (not IVFFlat): IVFFlat requires
-- enough rows to train its clusters — with a small/growing table like this
-- one, an IVFFlat index with a fixed `lists` count is badly undertrained and
-- silently returns wrong or empty results (confirmed: with 2 rows and
-- lists=100, match_chunks returned 0 rows for most queries and the wrong
-- chunk for others). HNSW has no such training step and stays correct from
-- the first row.
create index if not exists chunks_embedding_idx on chunks
  using hnsw (embedding vector_cosine_ops);
