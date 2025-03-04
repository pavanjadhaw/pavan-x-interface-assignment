import getUser from "@/utils/supabase/get-user";
import DocumentsPage from "./documents";
import { fetchDocuments, fetchDocumentActivities } from "../utils/queries";
import { DocumentsPageProps } from "./documents";
import {
  DocumentWithAuthor,
  DocumentActivityWithRelations,
} from "../hooks/useQueries";

// Enable revalidation every 30 seconds
export const revalidate = 30;

export default async function DocumentsPageContainer({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; limit?: string }>;
}) {
  const start = Date.now();

  // Get user profile first
  const { profile } = await getUser();

  if (!profile?.organizationId) {
    return (
      <DocumentsPage
        initialDocuments={[]}
        initialDocumentActivities={[]}
        initialNextCursor={null}
      />
    );
  }

  // Properly await searchParams before accessing its properties
  const params = await searchParams;
  const limit = params?.limit ? parseInt(params.limit, 10) : 10;

  // Then fetch documents and activities in parallel
  const [documentsResult, documentActivities] = await Promise.all([
    fetchDocuments({ organizationId: profile.organizationId, limit }),
    fetchDocumentActivities({ organizationId: profile.organizationId }),
  ]);

  const end = Date.now();
  console.log(`Documents page data fetching took ${end - start}ms`);

  // The documents from our query already have the correct structure
  // but TypeScript doesn't know that, so we use a safe type assertion
  const documents =
    documentsResult.documents as unknown as DocumentWithAuthor[];
  const activities =
    documentActivities as unknown as DocumentActivityWithRelations[];

  return (
    <DocumentsPage
      initialDocuments={documents}
      initialDocumentActivities={activities}
      initialNextCursor={documentsResult.nextCursor}
    />
  );
}
