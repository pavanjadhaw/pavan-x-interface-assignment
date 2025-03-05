import { useQuery } from "@tanstack/react-query";
import { getSupabaseServerClient } from "../utils/supabase/server";
import { getProfile, userProfileQueryKey } from "@/queries/get-profile";
import getQueryClient from "@/utils/get-query-client";

export async function fetchServerUser() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { profile: null };

  const { data: profile, error } = await getProfile(supabase, user.id);

  if (error) throw error;

  return {
    profile,
  };
}

export const getServerUser = () => {
  const queryClient = getQueryClient();

  return queryClient.fetchQuery({
    queryKey: userProfileQueryKey,
    queryFn: fetchServerUser,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
};
