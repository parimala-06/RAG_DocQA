# Archive — Document Q&A (RAG)

Upload a PDF, ask questions about it, get answers with clickable citations
back to the exact source passage. Built with Next.js, Supabase (pgvector),
and the Gemini API — entirely on free tiers, no credit card required.

## How it works

1. **Upload** — a PDF is parsed, split into overlapping text chunks, and each
   chunk is turned into a vector embedding (`gemini-embedding-001`), stored in
   Supabase Postgres with the `pgvector` extension.
2. **Ask** — your question is embedded the same way, and Supabase runs a
   cosine-similarity search to pull the 5 most relevant chunks.
3. **Answer** — those chunks are handed to Gemini (`gemini-flash-latest`) with
   a prompt that forces it to answer only from the excerpts and cite which one
   it used, e.g. `[1]`, `[2]`. The UI turns those into clickable markers.

The left panel lists every document ingested so far (fetched from Supabase,
so it persists across reloads — not just what you uploaded this session).
Each has a **Summarize** button that reassembles its full text from all its
chunks and asks Gemini for a plain-prose summary, shown in a popup, and a
**Delete** button (click once to arm it, click again within a few seconds to
confirm — no jarring native browser confirm dialog) that removes the
document and its chunks (cascade delete) permanently.

This is a real (if minimal) RAG pipeline — the same shape used in production
systems, just without the scale.

## Setup (15–20 minutes)

### 1. Get a free Gemini API key
Go to https://aistudio.google.com/apikey → "Create API key". No credit card
needed for the free tier.

### 2. Create a free Supabase project
Go to https://supabase.com → New project (free tier is plenty for this).
Once it's created:
- Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run.
  This creates the `documents` and `chunks` tables, enables `pgvector`, and
  adds the similarity-search function.
- Go to **Storage** → **New bucket** → name it `documents` → make it
  **Private** → Create. (This holds the original PDFs for the preview
  feature. It can't be created via SQL — Supabase silently ignores
  `insert into storage.buckets` from the SQL Editor.)
- Go to **Project Settings → API** and copy:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `service_role` key (not the anon key) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure environment variables
```bash
cp .env.example .env.local
# then fill in GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

### 4. Install and run
```bash
npm install
npm run dev
```
Open http://localhost:3000, upload a PDF, and start asking questions.

## Notes on free-tier limits

- Gemini's free tier has a requests-per-minute cap — `lib/gemini.js` adds a
  small delay between chunk embeddings so a large PDF doesn't get rate-limited.
- Everything here uses the `service_role` Supabase key server-side only
  (in API routes), never exposed to the browser.
- `pdfjs-dist` handles standard text-based PDFs. Scanned/image-only PDFs would
  need OCR first — out of scope for a one-day build, worth mentioning as a
  "next step" if this comes up in an interview.

## A note on free-tier daily quotas

Gemini's free tier caps `generateContent` at a small number of requests per
day — and that cap is tracked **per exact model name**, separately. `lib/gemini.js`
tries `gemini-flash-latest` first and, only if that model's daily quota is
exhausted, automatically falls back to `gemini-flash-lite-latest` (a
completely separate quota bucket) before giving up. This roughly multiplies
the day's usable capacity instead of just hitting the same wall under a
different name. If you exhaust both, the error message says so plainly and
tells you it resets daily — add more model names to `GENERATION_MODELS` if
you need more headroom, or switch to a different API key/project.

## A note on PDF parsing

The spec called for the `pdf-parse` package, but it bundles a 2018-era build
of `pdf.js` with no recovery for malformed cross-reference tables — a quirk
real-world PDFs hit often enough that it broke on the first real upload
tested here (`FormatError: bad XRef entry`). Swapped it for `pdfjs-dist`
directly (`lib/pdf.js`), which rebuilds a corrupt xref table by scanning the
file for objects instead of just failing. `next.config.mjs` marks
`pdfjs-dist` as a server-external package so its worker-loading logic
resolves correctly under Next's build.

## A note on the Gemini model name

Google retired `gemini-2.5-flash` for new API keys shortly before this was
built (confirmed live: it now 404s with "no longer available to new users").
The app uses `gemini-flash-latest` instead — an alias Google keeps pointed at
its current recommended flash model, so this doesn't need updating again the
next time a specific dated model gets retired. Swap it for a pinned model
name (e.g. `gemini-3.6-flash`) in `lib/gemini.js` if you want reproducible
behavior instead of an auto-updating alias.

## A note on dependency versions

`npm audit` flags known CVEs in `next@14.2.15` (patched only in the Next 16
major line). This app doesn't use middleware, `next/image`, or Server
Actions — the surfaces those CVEs target — so exposure is low for local dev
or a portfolio deploy. Worth an intentional upgrade before using this as a
base for anything handling real user data.

## Possible extensions (good "what would you add next" answers)
- Streaming answers token-by-token instead of waiting for the full response
- Multi-document filtering (ask questions scoped to one uploaded file)
- Add an OCR fallback (e.g. Tesseract) for scanned/image-only documents
- Add authentication so each user only sees their own documents
- Re-rank retrieved chunks with a cross-encoder before generating the answer
