import { TypedSupabaseClient } from "@/utils/supabase/types";

type GetOrganizationActivityParams = {
  organizationId: string;
};

export const getOrganizationActivity = (
  client: TypedSupabaseClient,
  { organizationId }: GetOrganizationActivityParams
) => {
  return client
    .from("DocumentActivity")
    .select(
      `
      id,
      createdAt,
      actionType,
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
    .eq("organizationId", organizationId)
    .order("createdAt", { ascending: false })
    .limit(20);
};

export type GetOrganizationActivityResponse = Awaited<
  ReturnType<typeof getOrganizationActivity>
>["data"];
