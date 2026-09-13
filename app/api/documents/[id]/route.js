import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Chunks cascade-delete automatically via the chunks.document_id foreign
// key's `on delete cascade` (see supabase/schema.sql) — no separate cleanup
// query needed here.
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Document id is required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error, count } = await supabase
      .from("documents")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;

    if (count === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/documents/${params?.id} failed:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
