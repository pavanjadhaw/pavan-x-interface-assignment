import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Document,
  DocumentActivity,
  Profile as PrismaProfile,
} from "@prisma/client";
import useUser from "@/hooks/use-user";

// Define the document result type with the shape returned by our API
export interface DocumentWithAuthor
  extends Pick<Document, "id" | "title" | "updatedAt" | "content"> {
  author: {
    email: string;
  };
  _count: {
    revisions: number;
  };
}

export interface DocumentsResult {
  documents: DocumentWithAuthor[];
  nextCursor: string | null;
}

export interface DocumentActivityWithRelations extends DocumentActivity {
  actor: {
    email: string;
  };
  document: {
    title: string;
  };
}

// Query keys
export const queryKeys = {
  documents: "documents",
  documentActivities: "document-activities",
  userProfile: "user-profile",
};

// User profile hook
export function useUserProfile() {
  const { profile, loading } = useUser();

  // Since we redirect to login if user doesn't exist,
  // we can safely assume profile will exist after loading
  return {
    data: { profile },
    isLoading: loading,
    error: null,
  };
}

// Documents hook
export function useDocuments(
  organizationId: string,
  limit: number = 10,
  initialData?: any
) {
  return useQuery({
    queryKey: [queryKeys.documents, organizationId, limit],
    queryFn: async () => {
      if (!organizationId) {
        return { documents: [], nextCursor: null };
      }

      // Use the API route instead of direct Prisma calls
      const url = new URL("/api/documents", window.location.origin);
      url.searchParams.append("limit", limit.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      return {
        documents: data.documents,
        nextCursor: data.pagination?.nextCursor || null,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes to reduce flashing
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    initialData,
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });
}

// Document activities hook
export function useDocumentActivities(
  organizationId: string,
  limit: number = 10,
  initialData?: any
) {
  return useQuery({
    queryKey: [queryKeys.documentActivities, organizationId, limit],
    queryFn: async () => {
      if (!organizationId) {
        return { activities: [] };
      }

      // Use the API route instead of direct Prisma calls
      const url = new URL("/api/document-activities", window.location.origin);
      url.searchParams.append("limit", limit.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch document activities");
      }

      const data = await response.json();
      return { activities: data.activities || [] };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    initialData,
  });
}

// Load more documents mutation
export function useLoadMoreDocuments(
  organizationId: string,
  limit: number = 10
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cursor: string | null) => {
      console.log("Loading more documents with cursor:", cursor);

      // Use the API route instead of direct Prisma calls
      const url = new URL("/api/documents", window.location.origin);
      if (cursor) {
        url.searchParams.append("cursor", cursor);
      }
      url.searchParams.append("limit", limit.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to load more documents");
      }

      const data = await response.json();
      return {
        documents: data.documents,
        nextCursor: data.pagination?.nextCursor || null,
      };
    },
    onSuccess: (data: any) => {
      console.log("Load more success:", data);
      // Get the current data from the cache
      const currentData = queryClient.getQueryData([
        queryKeys.documents,
        organizationId,
        limit,
      ]) as DocumentsResult | undefined;

      if (currentData) {
        // Create a Set of existing document IDs for quick lookup
        const existingIds = new Set(currentData.documents.map((doc) => doc.id));

        // Filter out any duplicates from the new documents
        const newUniqueDocuments = data.documents.filter(
          (doc: DocumentWithAuthor) => !existingIds.has(doc.id)
        );

        // Update the query data with merged documents and the new cursor
        queryClient.setQueryData([queryKeys.documents, organizationId, limit], {
          documents: [...currentData.documents, ...newUniqueDocuments],
          nextCursor: data.nextCursor,
        });
      }
    },
    onError: (error) => {
      console.error("Load more error:", error);
    },
  });
}
