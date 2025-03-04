import { createClient } from "@/utils/supabase/client";
import { Document, Revision } from "@prisma/client";
import {
  RealtimePostgresChangesPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useEffect } from "react";
import { DocumentPageProps } from "../document";
import { QueryClient } from "@tanstack/react-query";

interface UseRealtimeDocumentActivityProps {
  document: DocumentPageProps["initialDocument"];
  queryClient: QueryClient;
  setRevisionsSeen: (seen: boolean) => void;
}

export const useRealtimeDocumentActivity = ({
  document,
  queryClient,
  setRevisionsSeen,
}: UseRealtimeDocumentActivityProps) => {
  useEffect(() => {
    const supabase = createClient();

    const documentChannel = supabase.channel("documents").on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Document",
        filter: `id=eq.${document.id}`,
      },
      (payload: RealtimePostgresUpdatePayload<Document>) => {
        queryClient.setQueryData(
          ["documents", document.id],
          (oldData: DocumentPageProps["initialDocument"] | undefined) => {
            if (!oldData) return undefined;

            return {
              ...oldData,
              title: payload.new.title,
              content: payload.new.content,
            };
          }
        );
      }
    );

    const documentRevisionsChannel = supabase.channel("documentRevisions").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Revision",
        filter: `documentId=eq.${document.id}`,
      },
      async (payload: RealtimePostgresChangesPayload<Revision>) => {
        if (payload.eventType === "UPDATE") {
          queryClient.setQueryData(
            ["documents", document.id],
            (oldData: DocumentPageProps["initialDocument"] | undefined) => {
              if (!oldData) return undefined;

              return {
                ...oldData,
                revisions: oldData.revisions.map((r) =>
                  r.id === payload.new.id && r.status !== payload.new.status
                    ? {
                        ...r,
                        ...payload.new,
                        updatedAt: new Date(payload.new.updatedAt),
                        createdAt: new Date(payload.new.createdAt),
                      }
                    : r
                ),
              };
            }
          );
        } else if (payload.eventType === "INSERT") {
          const { data } = await supabase
            .from("Profile")
            .select("email")
            .eq("id", payload.new.authorId)
            .single();

          queryClient.setQueryData(
            ["documents", document.id],
            (oldData: DocumentPageProps["initialDocument"] | undefined) => {
              if (!oldData) return undefined;

              const revisionExists = oldData.revisions.some(
                (r) => r.id === payload.new.id
              );

              if (revisionExists) {
                return oldData;
              }

              return {
                ...oldData,
                revisions: [
                  {
                    ...payload.new,
                    author: {
                      id: payload.new.authorId,
                      email: data?.email ?? "",
                    },
                    updatedAt: new Date(payload.new.updatedAt),
                    createdAt: new Date(payload.new.createdAt),
                  },
                  ...oldData.revisions,
                ],
              };
            }
          );

          setRevisionsSeen(false);
        }
      }
    );

    documentChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Subscribed to document updates for ${document.title}`);
      }
    });

    documentRevisionsChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Subscribed to revision updates for ${document.title}`);
      }
    });

    return () => {
      console.log(
        `Unsubscribing from realtime updates for document ${document.title}`
      );
      supabase.removeChannel(documentChannel);
      supabase.removeChannel(documentRevisionsChannel);
    };
  }, [document.id, document.title, queryClient, setRevisionsSeen]);
};
