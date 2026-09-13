import { NextResponse } from "next/server";
import { embedText, answerFromChunks } from "@/lib/gemini";
import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const queryEmbedding = await embedText(question);
    const supabase = getSupabase();

    const { data: matches, error } = await supabase.rpc("match_chunks", {
      query_embedding: queryEmbedding,
      match_count: 5,
    });

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        answer: "No documents have been uploaded yet — upload a PDF first.",
        sources: [],
      });
    }

    const answer = await answerFromChunks(question, matches);

    return NextResponse.json({
      answer,
      sources: matches.map((m, i) => ({
        index: i + 1,
        filename: m.filename,
        excerpt: m.content,
        similarity: m.similarity,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
