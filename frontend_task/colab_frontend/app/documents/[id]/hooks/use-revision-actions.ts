import { RevisionStatus } from "@prisma/client";
import { QueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { acceptRevision, rejectRevision } from "../../documents.actions";
import { DocumentPageProps } from "../document";

type UseRevisionActionsProps = {
  documentId: string;
  queryClient: QueryClient;
};

export const useRevisionActions = ({
  documentId,
  queryClient,
}: UseRevisionActionsProps) => {
  const handleAcceptRevision = useCallback(
    (id: string) => {
      // Optimistically update the UI
      queryClient.setQueryData(
        ["documents", documentId],
        (oldData: DocumentPageProps["initialDocument"] | undefined) => {
          if (!oldData) return undefined;

          return {
            ...oldData,
            revisions: oldData.revisions.map((revision) =>
              revision.id === id
                ? {
                    ...revision,
                    status: RevisionStatus.ACCEPTED,
                    updatedAt: new Date(),
                  }
                : revision
            ),
          };
        }
      );

      // Call the server action
      acceptRevision({ id }).catch(() => {
        // Revert on error
        queryClient.setQueryData(
          ["documents", documentId],
          (oldData: DocumentPageProps["initialDocument"] | undefined) => {
            if (!oldData) return undefined;

            return {
              ...oldData,
              revisions: oldData.revisions.map((revision) =>
                revision.id === id
                  ? { ...revision, status: RevisionStatus.PENDING }
                  : revision
              ),
            };
          }
        );
      });
    },
    [documentId, queryClient]
  );

  const handleRejectRevision = useCallback(
    (id: string) => {
      // Optimistically update the UI
      queryClient.setQueryData(
        ["documents", documentId],
        (oldData: DocumentPageProps["initialDocument"] | undefined) => {
          if (!oldData) return undefined;

          return {
            ...oldData,
            revisions: oldData.revisions.map((revision) =>
              revision.id === id
                ? {
                    ...revision,
                    status: RevisionStatus.REJECTED,
                    updatedAt: new Date(),
                  }
                : revision
            ),
          };
        }
      );

      // Call the server action
      rejectRevision({ id }).catch(() => {
        // Revert on error
        queryClient.setQueryData(
          ["documents", documentId],
          (oldData: DocumentPageProps["initialDocument"] | undefined) => {
            if (!oldData) return undefined;

            return {
              ...oldData,
              revisions: oldData.revisions.map((revision) =>
                revision.id === id
                  ? { ...revision, status: RevisionStatus.PENDING }
                  : revision
              ),
            };
          }
        );
      });
    },
    [documentId, queryClient]
  );

  return { handleAcceptRevision, handleRejectRevision };
};
