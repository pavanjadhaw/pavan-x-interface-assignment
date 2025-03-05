import { TypedSupabaseClient } from "@/utils/supabase/types";

type GetDocumentParams = {
  id: string;
};

export const getDocument = (
  client: TypedSupabaseClient,
  { id }: GetDocumentParams
) => {
  return client
    .from("Document")
    .select(
      `
      id,
      title,
      content,
      createdAt,
      updatedAt,
      author:Profile (
        id,
        email
      )
    `
    )
    .eq("id", id)
    .single();
};

export type GetDocumentResponse = Awaited<
  ReturnType<typeof getDocument>
>["data"];
