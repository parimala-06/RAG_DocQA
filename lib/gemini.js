import { GoogleGenAI } from "@google/genai";

// Created lazily (not at module load) so `next build` doesn't require
// GEMINI_API_KEY to be set just to collect route data.
let _ai;

function getAi() {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}

const RETRYABLE_STATUS = new Set([429, 503]);

// A 429 can mean two very different things: a short-lived per-minute rate
// limit (worth retrying with backoff) or a free-tier per-day quota being
// fully used up (retrying within seconds is pointless — it only resets
// daily). @google/genai's ApiError.message is the raw JSON error body, so
// we can tell them apart by inspecting the quota violation it reports.
function isDailyQuotaExhausted(err) {
  if (err.status !== 429) return false;
  try {
    const body = JSON.parse(err.message);
    const violations = body?.error?.details?.flatMap((d) => d.violations || []) || [];
    return violations.some((v) => /PerDay/i.test(v.quotaId || ""));
  } catch {
    return false;
  }
}

// Gemini's free tier hits transient 503 ("high demand") and 429 (rate limit)
// errors under normal use — retrying a couple times with backoff clears most
// of them instead of failing the whole request over a momentary blip. Daily
// quota exhaustion is deliberately NOT retried here (it can't recover within
// seconds) — it's rethrown as-is so generateWithFallback can decide whether
// to try a different model.
async function withRetry(fn, { retries = 3, baseDelayMs = 1000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (isDailyQuotaExhausted(err) || attempt >= retries || !RETRYABLE_STATUS.has(err.status)) {
        throw err;
      }
      const delay = baseDelayMs * 2 ** attempt;
      console.error(`Gemini call failed with status ${err.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Free-tier daily quotas are tracked per exact model name, so a model that's
// used up for today is a completely separate bucket from another model —
// falling back to a second model on quota exhaustion effectively multiplies
// the day's usable capacity instead of just moving the bottleneck. Ordered
// best-quality first; only quota exhaustion advances to the next one — any
// other error (bad request, auth failure, etc.) surfaces immediately since
// it would fail identically on every model.
const GENERATION_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];

async function generateWithFallback(prompt) {
  let lastErr;
  for (const model of GENERATION_MODELS) {
    try {
      return await withRetry(() => getAi().models.generateContent({ model, contents: prompt }));
    } catch (err) {
      if (!isDailyQuotaExhausted(err)) throw err;
      console.error(`Daily quota exhausted for ${model}, trying next model`);
      lastErr = err;
    }
  }
  throw new Error(
    `Gemini's free-tier daily quota is used up for today across all fallback models (${GENERATION_MODELS.join(", ")}). ` +
      `It resets on a daily cycle — try again later, or use a different Gemini API key/project in the meantime.`
  );
}

// Turns a chunk of text into a 768-dim vector. Free tier covers this easily
// for a document of a few hundred chunks.
export async function embedText(text) {
  const response = await withRetry(() =>
    getAi().models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: { outputDimensionality: 768 },
    })
  );
  return response.embeddings[0].values;
}

// Embeds many chunks. Gemini's free tier has a request-per-minute limit,
// so we go one at a time with a small delay rather than firing them all at once.
// Errors are logged with the failing chunk's index before being rethrown —
// letting one bad chunk fail silently would desync `vectors` from `chunks`
// and corrupt the chunk_index -> embedding mapping on insert.
export async function embedChunks(chunks) {
  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    try {
      vectors.push(await embedText(chunks[i]));
    } catch (err) {
      console.error(`embedChunks: failed on chunk ${i}/${chunks.length}:`, err);
      throw err;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return vectors;
}

// Answers a question using only the retrieved chunks, citing which one(s)
// support each part of the answer by index.
export async function answerFromChunks(question, chunks) {
  const context = chunks
    .map((c, i) => `[${i + 1}] (source: ${c.filename})\n${c.content}`)
    .join("\n\n");

  const prompt = `You are a document Q&A assistant. Answer the question using ONLY the excerpts below. If the excerpts don't contain the answer, say so plainly — do not guess.

When you use information from an excerpt, cite it inline like [1] or [2] matching the excerpt numbers below.

Excerpts:
${context}

Question: ${question}

Answer:`;

  const response = await generateWithFallback(prompt);
  return response.text;
}

// Summarizes a whole document's reassembled text — no citations, since this
// isn't answering a specific question against numbered excerpts.
export async function summarizeDocument(fullText, filename) {
  const prompt = `Summarize the following document ("${filename}") in 2-4 short paragraphs. Capture its overall purpose, structure, and the key facts or figures it contains. Write plain prose — no citations, no excerpt numbers, no bullet points unless the source material is itself a list.

Document content:
${fullText}

Summary:`;

  const response = await generateWithFallback(prompt);
  return response.text;
}
