import { prisma } from "@/utils/prisma/client";
import AuthForm from "../components/auth-form";
import getQueryClient from "@/utils/get-query-client";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { getDemoAccounts } from "@/queries/get-demo-accounts";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function LoginPage() {
  const queryClient = getQueryClient();
  const supabase = await getSupabaseServerClient();

  await prefetchQuery(queryClient, getDemoAccounts(supabase));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthForm type="login" />
    </HydrationBoundary>
  );
}
