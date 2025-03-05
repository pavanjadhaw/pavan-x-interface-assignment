import { Database } from "@/supabase/types";
import { createBrowserClient } from "@supabase/ssr";

export const useSupabaseClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
