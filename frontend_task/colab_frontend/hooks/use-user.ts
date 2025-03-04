import { createClient } from "@/utils/supabase/client";
import { Database } from "@/supabase/types";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";

export type Profile = Database["public"]["Tables"]["Profile"]["Row"] & {
  organization: Database["public"]["Tables"]["Organization"]["Row"];
};

export default function useUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { user: null, profile: null };
      }

      const { data: profile } = await supabase
        .from("Profile")
        .select("*, organization:Organization(*)")
        .eq("id", user?.id ?? "")
        .single();

      return { user, profile };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Redirect to login if no user is found and we're not loading
  if (!isLoading && !data?.user) {
    redirect("/login");
  }

  return {
    user: data?.user || null,
    profile: data?.profile || null,
    loading: isLoading,
  };
}
