import { TypedSupabaseClient } from "@/utils/supabase/types";

type GetDocumentsParams = {
  organizationId: string;
  page?: number;
  pageSize?: number;
};

export const getDocuments = (
  client: TypedSupabaseClient,
  { organizationId, page = 1, pageSize = 10 }: GetDocumentsParams
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return client
    .from("Document")
    .select(
      `
      id,
      title,
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
    )
    .eq("organizationId", organizationId)
    .is("deletedAt", null)
    .order("updatedAt", { ascending: false })
    .range(from, to);
};

export type GetDocumentsResponse = Awaited<
  ReturnType<typeof getDocuments>
>["data"];
