import { TypedSupabaseClient } from "@/utils/supabase/types";

export const userProfileQueryKey = ["userProfile"];

export const getProfile = (client: TypedSupabaseClient, userId: string) => {
  return client
    .from("Profile")
    .select(
      `
      id,
      email,
      organization:Organization (
        id,
        name
      )
      `
    )
    .eq("id", userId)
    .single();
};
