import { useSubscriptionQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { useSupabaseClient } from "@/utils/supabase/client";

export const useRealtimeDocuments = (organizationId: string) => {
  const supabase = useSupabaseClient();

  useSubscriptionQuery(
    supabase,
    `organization:${organizationId}:documents`,
    {
      event: "*",
      table: "Document",
      schema: "public",
      filter: `organizationId=eq.${organizationId}`,
    },
    ["id"],
    `
      id,
      title,
      content,
      createdAt,
      updatedAt,
      author:Profile (
        id,
        email
      ),
      revisionsCount:Revision (
        count
      )
      `
  );
};
