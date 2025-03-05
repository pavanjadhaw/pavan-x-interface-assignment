"use client";

import { getProfile, userProfileQueryKey } from "@/queries/get-profile";
import { useSupabaseClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export async function fetchUser() {
  const supabase = useSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { profile: null };

  const { data: profile, error } = await getProfile(supabase, user.id);

  if (error) throw error;

  return { profile };
}

export function getUser() {
  return useQuery({
    queryKey: userProfileQueryKey,
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}
