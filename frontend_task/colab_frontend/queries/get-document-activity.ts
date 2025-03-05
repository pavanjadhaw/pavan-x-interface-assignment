import { TypedSupabaseClient } from "@/utils/supabase/types";

type GetDocumentActivityParams = {
  id: string;
};

export const getDocumentActivity = (
  client: TypedSupabaseClient,
  { id }: GetDocumentActivityParams
) => {
  return client
    .from("DocumentActivity")
    .select(
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
    )
    .eq("documentId", id)
    .order("createdAt", { ascending: false });
};

export type GetDocumentActivityResponse = Awaited<
  ReturnType<typeof getDocumentActivity>
>["data"];
