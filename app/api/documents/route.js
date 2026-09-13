import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Without this, Next statically caches this route at build time (no dynamic
// data usage it can detect) and would serve the same frozen document list
// forever in production, never reflecting new uploads.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Lists every document already ingested (persists across page reloads,
// unlike the upload-flow's in-memory React state).
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("documents")
      .select("id, filename, storage_path, created_at, chunks(count)")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const documents = data.map((d) => ({
      id: d.id,
      filename: d.filename,
      chunkCount: d.chunks?.[0]?.count ?? 0,
      hasFile: !!d.storage_path,
    }));

    return NextResponse.json(
      { documents },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("GET /api/documents failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
