import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { summarizeDocument } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, filename")
      .eq("id", documentId)
      .single();

    if (docError) throw docError;

    const { data: chunks, error: chunksError } = await supabase
      .from("chunks")
      .select("content")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true });

    if (chunksError) throw chunksError;

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "No content found for this document." },
        { status: 404 }
      );
    }

    // Chunks overlap by ~150 characters at their boundaries; that small
    // duplication is harmless for a summary and not worth deduplicating.
    const fullText = chunks.map((c) => c.content).join(" ");
    const summary = await summarizeDocument(fullText, doc.filename);

    return NextResponse.json({ filename: doc.filename, summary });
  } catch (err) {
    console.error("POST /api/summarize failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
