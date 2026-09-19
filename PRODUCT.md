# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **recruiters and hiring managers** evaluating the author's engineering
work. They open the live demo cold, with no context and little patience, upload
one of the bundled sample PDFs (or nothing at all), ask a question or two, and
form a judgment about the author's craft in well under two minutes. They are not
here to manage a document library — they are here to see whether the thing works
and whether the person who built it has taste.

Secondary (real, but not the path being optimized): someone with an actual
document — a policy, contract, handbook, or report — who needs an answer from it
and needs to be able to verify that answer is not invented.

## Product Purpose

Archive answers questions about uploaded PDFs using retrieval-augmented
generation, and makes every answer auditable: each claim carries a citation
marker that expands to the exact source passage it came from. If the retrieved
excerpts do not contain the answer, the model says so rather than guessing.

Success for the primary user is a moment of earned trust: they click a citation,
see the real excerpt, and believe the answer. Success for the project is that
this moment reads as deliberate engineering and deliberate design, not a wired-up
API call.

## Positioning

The verifiable citation is the product. Retrieval spans every uploaded document,
generation is prompt-constrained to the retrieved excerpts only, and the UI turns
the model's inline `[1]` / `[2]` markers into controls that reveal the underlying
passage text. A neighboring chatbot cannot truthfully claim that its answers are
checkable against a visible source excerpt in one click.

## Operating Context

Single-screen web app, desktop-first but used on phones. Two regions: a dark left
rail holding the corpus (upload, document list, per-document summarize / open-pdf
/ delete) and a light reading column holding the question thread and its cited
answers. Sessions are short. The whole loop — upload, ask, read, click a citation
— happens without navigation, without sign-in, and without leaving the page.

Evaluation context matters as much as usage context: the app is reached from a
README and a GitHub link, and is frequently seen for the first time as a
screenshot.

## Capabilities and Constraints

Confirmed capabilities:

- Upload a PDF; text is extracted, chunked (~1200 chars, 150 overlap), embedded
  (`gemini-embedding-001`, 768d), and stored in Supabase Postgres + pgvector.
- Ask a question; cosine similarity (HNSW) retrieves the top 5 chunks **across
  all documents**, and Gemini Flash generates an answer cited to those excerpts.
- Per document: summarize (full text reassembled from chunks), open the original
  PDF via a short-lived signed URL, delete (click-to-arm, 4s confirm window).
- Document list persists across reloads; it is fetched from Supabase, not session
  state.

Confirmed constraints (user-stated, binding):

- **PDF only, ~10MB ceiling, no OCR.** Scanned or image-only PDFs have no text
  layer and cannot be ingested. The interface must be honest about this rather
  than failing mysteriously.

Constraints evidenced in the codebase (preserve unless the user changes them):

- No authentication and no per-user scoping — one shared global corpus. The
  design must not imply private accounts or personal libraries.
- Answers are not streamed; the ask is a single request with a waiting state.
- Citations are excerpt-level, not page-level.
- Gemini's daily quota is real; `lib/gemini.js` falls back from
  `gemini-flash-latest` to `gemini-flash-lite-latest` before giving up.

## Brand Commitments

- Name: **Archive**. Wordmark set in Bricolage Grotesque, highlighted.
- Voice in the shipped copy is plain, declarative, and unhyped — "The archive is
  empty.", "Nothing to search yet.", "Searching the archive". No exclamation
  marks, no assistant persona, no emoji. Errors state what happened and what to
  do next.
- The visual identity is the "Waypoint" system (warm-dark rail, bright reading
  column, teal citation badges, a coral highlight accent, bold Bricolage
  Grotesque headline moments, generous rounding and glow) — see DESIGN.md. It
  replaced the
  "Tie-Out Ledger" system by deliberate user choice ("current theme looks
  dull and with no life"), inspired by a bold consumer travel-brand reference,
  not a refinement of the prior quiet system.
- A first-visit guided tour spotlights the upload control, then the ask
  control, and is replayable from the rail's "Guide" button.

## Evidence on Hand

- Five purpose-built sample PDFs in `SamplePdfs/` (insurance policy, employee
  handbook, API reference, quarterly report, multi-page offer letter), each with
  suggested questions in the README.
- A deployed instance at https://doc-qa-rag-black.vercel.app and public source at
  https://github.com/parimala-06/RAG_DocQA.
- A screenshot at `docs/screenshot.jpg`.
- Engineering notes in the README documenting real bugs found and fixed.

No customers, no testimonials, no usage numbers, no benchmarks, no pricing. None
may be fabricated.

## Product Principles

1. **Verifiability is the feature.** Anything that makes the path from claim to
   source passage shorter or more obvious is worth the space; anything that makes
   a citation look decorative is a defect.
2. **The first ninety seconds carry the product.** A cold visitor must understand
   what this is, what to do, and why the answer can be trusted, without reading
   instructions.
3. **Be honest about limits.** Out-of-scope questions get "the excerpts don't
   cover that." Unsupported files get a clear reason. Nothing pretends.
4. **The corpus is a working set, not a filing system.** Document management is a
   small toolkit in service of asking, never the main event.
5. **Quiet over loud.** Confidence comes from typographic and material precision,
   not from decoration, gradients, or exclamation.
