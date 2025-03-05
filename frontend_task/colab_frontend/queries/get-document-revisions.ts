import { TypedSupabaseClient } from "@/utils/supabase/types";

type GetDocumentRevisionsParams = {
  id: string;
};

export const getDocumentRevisions = (
  client: TypedSupabaseClient,
  { id }: GetDocumentRevisionsParams
) => {
  return client
    .from("Revision")
    .select(
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
    )
    .eq("documentId", id)
    .order("createdAt", { ascending: false });
};

export type GetDocumentRevisionsResponse = Awaited<
  ReturnType<typeof getDocumentRevisions>
>["data"];
