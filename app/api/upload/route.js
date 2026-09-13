import { NextResponse } from "next/server";
import { extractPdfText } from "@/lib/pdf";
import { chunkText } from "@/lib/chunk";
import { embedChunks } from "@/lib/gemini";
import { getSupabase } from "@/lib/supabase";
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from "@/lib/constants";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File is too large — the maximum size is ${MAX_FILE_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractPdfText(buffer);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Couldn't extract any text from this PDF." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({ filename: file.name })
      .select()
      .single();

    if (docError) throw docError;

    // Store the original PDF for later preview. Non-critical: if this fails,
    // log it and continue — the core RAG pipeline below doesn't depend on it,
    // the document just won't have a preview available.
    const storagePath = `${doc.id}.pdf`;
    let fileStored = false;
    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, { contentType: "application/pdf" });

    if (storageError) {
      console.error(`upload: storing original PDF failed for document ${doc.id}:`, storageError);
    } else {
      const { error: pathUpdateError } = await supabase
        .from("documents")
        .update({ storage_path: storagePath })
        .eq("id", doc.id);
      if (pathUpdateError) {
        console.error(`upload: saving storage_path failed for document ${doc.id}:`, pathUpdateError);
      } else {
        fileStored = true;
      }
    }

    console.log(`upload: document ${doc.id} (${file.name}) — embedding ${chunks.length} chunks`);
    const embeddings = await embedChunks(chunks);

    const rows = chunks.map((content, i) => ({
      document_id: doc.id,
      content,
      chunk_index: i,
      embedding: embeddings[i],
    }));

    const { error: chunkError } = await supabase.from("chunks").insert(rows);
    if (chunkError) {
      console.error(`upload: chunk insert failed for document ${doc.id}:`, chunkError);
      throw chunkError;
    }

    // Verify against the actual table state rather than trusting `rows.length` —
    // a partial insert failure wouldn't necessarily surface as `chunkError`
    // (e.g. Postgres RLS silently filtering rows), so re-count for real.
    const { count: insertedCount, error: countError } = await supabase
      .from("chunks")
      .select("id", { count: "exact", head: true })
      .eq("document_id", doc.id);

    if (countError) {
      console.error(`upload: post-insert verification query failed for document ${doc.id}:`, countError);
    } else if (insertedCount !== chunks.length) {
      console.error(
        `upload: chunk count mismatch for document ${doc.id} — intended ${chunks.length}, verified ${insertedCount} actually in the table`
      );
    }

    return NextResponse.json({
      documentId: doc.id,
      filename: file.name,
      chunkCount: insertedCount ?? chunks.length,
      chunkCountVerified: countError ? null : insertedCount === chunks.length,
      hasFile: fileStored,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
