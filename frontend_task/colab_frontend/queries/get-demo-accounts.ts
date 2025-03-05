import { TypedSupabaseClient } from "@/utils/supabase/types";

export const getDemoAccounts = (client: TypedSupabaseClient) => {
  return client
    .from("Organization")
    .select(
      `
      id,
      name,
      slug,
      users:Profile (
        id,
        email
      )
    `
    )
    .limit(2);
};

export type GetDemoAccountsResponse = Awaited<
  ReturnType<typeof getDemoAccounts>
>["data"];
