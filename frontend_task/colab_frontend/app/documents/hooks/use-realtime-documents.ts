import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { DocumentActionType } from "@prisma/client";
import {
  RealtimePostgresChangesPayload,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import {
  queryKeys,
  DocumentWithAuthor,
  DocumentActivityWithRelations,
} from "@/app/hooks/useQueries";
import { Profile } from "@/hooks/use-user";
import { Database } from "@/supabase/types";

interface UseRealtimeDocumentsProps {
  organizationId?: string;
  enabled?: boolean;
}

export const useRealtimeDocuments = ({
  organizationId,
  enabled = true,
}: UseRealtimeDocumentsProps) => {
  // Use a ref to store the supabase client to avoid recreating it on each render
  const supabaseRef = useRef(createClient());
  const queryClient = useQueryClient();

  useEffect(() => {
    // Early return if no organizationId or not enabled
    if (!organizationId || !enabled) return;

    const supabase = supabaseRef.current;

    // Create a single channel for both document and activity changes
    const channel = supabase
      .channel(`org-${organizationId}`)
      // Document changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Document",
          filter: `organizationId=eq.${organizationId}`,
        },
        async (
          payload: RealtimePostgresChangesPayload<
            Database["public"]["Tables"]["Document"]["Row"]
          >
        ) => {
          // Update TanStack Query cache
          if (payload.eventType === "UPDATE") {
            // Update documents in all relevant queries
            queryClient.setQueriesData(
              { queryKey: [queryKeys.documents, organizationId] },
              (oldData: any) => {
                if (!oldData) return oldData;

                // Handle both regular and infinite queries
                if (oldData.documents) {
                  return {
                    ...oldData,
                    documents: oldData.documents.map(
                      (document: DocumentWithAuthor) =>
                        document.id === payload.new.id
                          ? {
                              ...document,
                              title: payload.new.title,
                              content: payload.new.content || document.content,
                              updatedAt: new Date(payload.new.updatedAt),
                            }
                          : document
                    ),
                  };
                }

                return oldData;
              }
            );
          } else if (payload.eventType === "INSERT") {
            // For INSERT events, we need to fetch the author data
            // We'll use the actorId from the payload if available
            const actorId = (payload.new as any).authorId;
            if (!actorId) return;

            // Batch fetch author data instead of individual queries
            const { data } = await supabase
              .from("Profile")
              .select("email")
              .eq("id", actorId)
              .single();

            // Create the new document object
            const newDocument: DocumentWithAuthor = {
              id: payload.new.id,
              title: payload.new.title,
              content: payload.new.content || "",
              updatedAt: new Date(payload.new.updatedAt),
              author: {
                email: data?.email ?? "",
              },
              _count: {
                revisions: 0,
              },
            };

            // Update TanStack Query cache
            queryClient.setQueriesData(
              { queryKey: [queryKeys.documents, organizationId] },
              (oldData: any) => {
                if (!oldData) return oldData;

                // Handle both regular and infinite queries
                if (oldData.documents) {
                  // Check if document already exists
                  if (
                    oldData.documents.some(
                      (doc: DocumentWithAuthor) => doc.id === payload.new.id
                    )
                  ) {
                    return oldData;
                  }

                  return {
                    ...oldData,
                    documents: [newDocument, ...oldData.documents],
                  };
                }

                return oldData;
              }
            );
          } else if (payload.eventType === "DELETE") {
            // Update TanStack Query cache
            queryClient.setQueriesData(
              { queryKey: [queryKeys.documents, organizationId] },
              (oldData: any) => {
                if (!oldData) return oldData;

                // Handle both regular and infinite queries
                if (oldData.documents) {
                  return {
                    ...oldData,
                    documents: oldData.documents.filter(
                      (doc: DocumentWithAuthor) => doc.id !== payload.old.id
                    ),
                  };
                }

                return oldData;
              }
            );
          }
        }
      )
      // Document activity changes
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "DocumentActivity",
          filter: `organizationId=eq.${organizationId}`,
        },
        async (payload: RealtimePostgresInsertPayload<any>) => {
          // Fetch both profile and document data in parallel
          const [profileData, documentData] = await Promise.all([
            supabase
              .from("Profile")
              .select("email")
              .eq("id", payload.new.actorId)
              .single(),
            supabase
              .from("Document")
              .select("title")
              .eq("id", payload.new.documentId)
              .single(),
          ]);

          const newActivity: DocumentActivityWithRelations = {
            ...payload.new,
            actor: {
              email: profileData.data?.email ?? "",
            },
            document: {
              title: documentData.data?.title ?? "",
            },
          };

          // Update TanStack Query cache
          queryClient.setQueriesData(
            {
              queryKey: [queryKeys.documentActivities, organizationId],
            },
            (oldData: any) => {
              if (!oldData) return oldData;

              // Handle activities data structure
              if (oldData.activities) {
                return {
                  ...oldData,
                  activities: [newActivity, ...oldData.activities],
                };
              }

              // If it's an array, assume it's the activities array directly
              if (Array.isArray(oldData)) {
                return [newActivity, ...oldData];
              }

              return oldData;
            }
          );
        }
      );

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Subscribed to realtime updates for org ${organizationId}`);
      }
    });

    // Cleanup function
    return () => {
      console.log(
        `Unsubscribing from realtime updates for org ${organizationId}`
      );
      supabase.removeChannel(channel);
    };
  }, [organizationId, enabled, queryClient]);
};
