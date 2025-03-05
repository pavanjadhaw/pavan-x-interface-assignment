import { useSubscriptionQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { useSupabaseClient } from "@/utils/supabase/client";

export const useRealtimeDocument = (documentId: string) => {
  const supabase = useSupabaseClient();

  useSubscriptionQuery(
    supabase,
    `document:${documentId}`,
    {
      event: "*",
      table: "Document",
      schema: "public",
      filter: `id=eq.${documentId}`,
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

  useSubscriptionQuery(
    supabase,
    `document:${documentId}:revisions`,
    {
      event: "*",
      table: "Revision",
      schema: "public",
      filter: `documentId=eq.${documentId}`,
    },
    ["id"],
    `
      id,
      content,
      status,
      createdAt,
      updatedAt,
      author:Profile (
        id,
        email
      ),
      activities:RevisionActivity (
        id,
        actionType,
        createdAt,
        actor:Profile (
          id,
          email
        )
      )
    `
  );

  useSubscriptionQuery(
    supabase,
    `document:${documentId}:activities`,
    {
      event: "*",
      table: "DocumentActivity",
      schema: "public",
      filter: `documentId=eq.${documentId}`,
    },
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
