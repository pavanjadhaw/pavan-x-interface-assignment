import { getDocuments } from "@/queries/get-documents";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { DocumentsPage } from "./documents-page";
import getQueryClient from "@/utils/get-query-client";
import { fetchServerUser, getServerUser } from "@/hooks/use-server-user";
import { getUser } from "@/hooks/use-user";
import { userProfileQueryKey } from "@/queries/get-profile";
import { getDocumentsCount } from "@/queries/get-documents-count";
import { getOrganizationActivity } from "@/queries/get-organization-activity";

type DocumentsPageContainerProps = {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
};

export default async function DocumentsPageContainer({
  searchParams,
}: DocumentsPageContainerProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const pageSize =
    typeof params.pageSize === "string" ? parseInt(params.pageSize) : 10;

  const queryClient = getQueryClient();
  const supabase = await getSupabaseServerClient();

  const { profile } = await getServerUser();

  if (profile?.organization.id) {
    await Promise.all([
      prefetchQuery(
        queryClient,
        getDocuments(supabase, {
          organizationId: profile.organization.id,
          page,
          pageSize,
        })
      ),
      prefetchQuery(
        queryClient,
        getDocumentsCount(supabase, {
          organizationId: profile.organization.id,
        })
      ),
      prefetchQuery(
        queryClient,
        getOrganizationActivity(supabase, {
          organizationId: profile.organization.id,
        })
      ),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentsPage initialPage={page} initialPageSize={pageSize} />
    </HydrationBoundary>
  );
}
