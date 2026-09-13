import { createClient } from "@supabase/supabase-js";

// Server-side only client — uses the service role key so it can bypass RLS.
// Never import this file into client components.
// Created lazily (not at module load) so `next build` doesn't require
// Supabase credentials to be set just to collect route data.
let _supabase;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabase;
}
