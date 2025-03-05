import { TypedSupabaseClient } from "@/utils/supabase/types";

type GetDocumentsCountParams = {
  organizationId: string;
};

export const getDocumentsCount = (
  client: TypedSupabaseClient,
  { organizationId }: GetDocumentsCountParams
) => {
  return client
    .from("Document")
    .select(
      `
      id,
      organizationId
      `,
      { count: "exact", head: true }
    )
    .eq("organizationId", organizationId)
    .is("deletedAt", null);
};
