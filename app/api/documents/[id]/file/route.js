import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Redirects to a short-lived signed URL for the original PDF, so the eye
// icon can just be a plain link (`<a href=... target="_blank">`) instead of
// needing client-side JS to fetch and re-present a signed URL.
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const supabase = getSupabase();

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("storage_path, filename")
      .eq("id", id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!doc.storage_path) {
      return NextResponse.json(
        { error: "No stored file for this document — it was ingested before file preview was added." },
        { status: 404 }
      );
    }

    const { data: signed, error: signError } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 300);

    if (signError) throw signError;

    // no-store: a 307 is otherwise cacheable, and a cached copy would replay
    // an already-expired signed URL if this link is opened again later
    // (e.g. from browser history) well past the signed URL's TTL.
    return NextResponse.redirect(signed.signedUrl, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(`GET /api/documents/${params?.id}/file failed:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
