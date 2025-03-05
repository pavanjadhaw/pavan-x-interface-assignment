import { TypedSupabaseClient } from "@/utils/supabase/types";

export const getDemoAccounts = (client: TypedSupabaseClient) => {
  return client.from("Organization").select(
    `
      id,
      name,
      slug,
      users:Profile (
        id,
        email
      )
    `
  );
};

export type GetDemoAccountsResponse = Awaited<
  ReturnType<typeof getDemoAccounts>
>["data"];
