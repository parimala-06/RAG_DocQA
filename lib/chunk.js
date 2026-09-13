// Splits text into overlapping chunks, roughly sized in characters
// (good enough proxy for tokens for a one-day project).
export function chunkText(text, chunkSize = 1200, overlap = 150) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks.filter((c) => c.length > 30);
}
