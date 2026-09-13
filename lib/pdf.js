import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Note: don't touch GlobalWorkerOptions.workerSrc here — pdfjs-dist detects
// Node at module load and sets its own working default (a relative import
// of its bundled worker file). Overriding it (even to "") breaks that.

// Extracts plain text from a PDF buffer. Uses pdfjs-dist's legacy Node build
// directly (not the unmaintained pdf-parse package, which bundles a 2018-era
// pdf.js with no recovery for malformed cross-reference tables — a failure
// mode real-world PDFs hit often enough to matter).
export async function extractPdfText(buffer) {
  const doc = await getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  }).promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n\n";
  }

  await doc.destroy();
  return text;
}
