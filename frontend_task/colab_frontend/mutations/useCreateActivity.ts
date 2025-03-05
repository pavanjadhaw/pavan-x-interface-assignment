import { TypedSupabaseClient } from "@/utils/supabase/types";
import { useInsertMutation } from "@supabase-cache-helpers/postgrest-react-query";

export const useCreateActivity = (supabase: TypedSupabaseClient) => {
  return useInsertMutation(
    supabase.from("DocumentActivity"),
    ["id"],
    `
      id,
      actionType,
      createdAt,
      actor:Profile (
        id,
        email
      ),
      document:Document (
        id,
        title
      )
    `
  );
};
