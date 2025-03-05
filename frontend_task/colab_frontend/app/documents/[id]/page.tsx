import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { DocumentsPage } from "../documents-page";
import page from "../page";
import getQueryClient from "@/utils/get-query-client";
import DocumentPage from "./document-page";
import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { getDocument } from "@/queries/get-document";
import { getSupabaseServerClient } from "@/utils/supabase/server";

interface DocumentPageContainerProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPageContainer({
  params,
}: DocumentPageContainerProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const supabase = await getSupabaseServerClient();

  await prefetchQuery(queryClient, getDocument(supabase, { id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentPage />
    </HydrationBoundary>
  );
}
