"use client";
import useUser from "@/hooks/use-user";
import {
  Badge,
  Box,
  Container,
  Divider,
  Flex,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  Document,
  DocumentActivity,
  Profile,
  Revision,
  RevisionStatus,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { ArchivedRevisionCard } from "./components/archived-revision-card";
import { DeleteDocumentDialog } from "./components/delete-document-dialog";
import { EditDocumentDrawer } from "./components/edit-document-drawer";
import { NewRevisionDialog } from "./components/new-revision-dialog";
import { RevisionCard } from "./components/revision-card";
import { RevisionHistoryBottomSheet } from "./components/revision-history-bottomsheet";
import { RevisionHistoryDrawer } from "./components/revision-history-drawer";
import { RevisionHistoryTabs } from "./components/revision-history-tabs";
import { useRealtimeDocumentActivity } from "./hooks/use-realtime-document-activity";
import { useRevisionActions } from "./hooks/use-revision-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type DocumentPageProps = {
  initialDocument: Document & {
    activities: (DocumentActivity & {
      actor: {
        id: string;
        email: string;
      };
    })[];
    revisions: (Revision & {
      author: {
        id: string;
        email: string;
      };
    })[];
  };
};

export default function DocumentPage({ initialDocument }: DocumentPageProps) {
  const { profile } = useUser();
  const isMobile = useMediaQuery(`(max-width: 48em)`);
  const queryClient = useQueryClient();
  const [revisionsSeen, setRevisionsSeen] = useState(false);

  // Use React Query to manage document state
  const { data: document } = useQuery({
    queryKey: ["documents", initialDocument.id],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${initialDocument.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      return await response.json();
    },
    initialData: initialDocument,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Hydrate the query cache with initial data
  useEffect(() => {
    queryClient.setQueryData(
      ["documents", initialDocument.id],
      initialDocument
    );
  }, [initialDocument, queryClient, initialDocument.id]);

  const { handleAcceptRevision, handleRejectRevision } = useRevisionActions({
    documentId: document.id,
    queryClient,
  });

  useRealtimeDocumentActivity({
    document,
    queryClient,
    setRevisionsSeen,
  });

  const pendingRevisions = (
    <Stack>
      {document.revisions
        .filter(
          (revision: Revision) => revision.status === RevisionStatus.PENDING
        )
        .map(
          (revision: Revision & { author: { id: string; email: string } }) => (
            <RevisionCard
              key={revision.id}
              revision={revision}
              onAccept={() => handleAcceptRevision(revision.id)}
              onReject={() => handleRejectRevision(revision.id)}
            />
          )
        )}
    </Stack>
  );

  const archivedRevisions = (
    <Stack>
      {document.revisions
        .filter(
          (revision: Revision) => revision.status !== RevisionStatus.PENDING
        )
        .sort(
          (a: { updatedAt: Date }, b: { updatedAt: Date }) =>
            b.updatedAt.getTime() - a.updatedAt.getTime()
        )
        .map(
          (revision: Revision & { author: { id: string; email: string } }) => (
            <ArchivedRevisionCard key={revision.id} revision={revision} />
          )
        )}
    </Stack>
  );

  const pendingRevisionsCount = document.revisions.filter(
    (revision: Revision) => revision.status === RevisionStatus.PENDING
  ).length;

  const revisionAndActivityHistory = (
    <RevisionHistoryTabs
      isMobile={!!isMobile}
      document={document}
      pendingRevisions={pendingRevisions}
      archivedRevisions={archivedRevisions}
    />
  );

  return (
    <>
      <Container>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap="md"
        >
          <Title
            order={4}
            style={{
              wordBreak: "break-word",
              marginBottom: isMobile ? "var(--mantine-spacing-xs)" : 0,
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            {document.title}
          </Title>

          <Box style={{ flexShrink: 0 }}>
            <Group gap="xs" justify="flex-end" wrap="nowrap">
              <NewRevisionDialog
                profile={profile as unknown as Profile}
                document={document}
              />
              <RevisionHistoryDrawer>
                {revisionAndActivityHistory}
              </RevisionHistoryDrawer>
              <EditDocumentDrawer document={document} />
              <DeleteDocumentDialog document={document} />
            </Group>
          </Box>
        </Flex>
        <Divider my="sm" />
        <Flex justify="space-between">
          <Box style={{ width: "100%", maxWidth: "320px" }}>
            <Text
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {document.content}
            </Text>
          </Box>
          <ScrollArea
            overscrollBehavior="contain"
            h="calc(100vh - 140px)"
            visibleFrom="sm"
            offsetScrollbars="y"
            type="never"
          >
            {pendingRevisions}
          </ScrollArea>
        </Flex>
      </Container>
      <RevisionHistoryBottomSheet
        title={
          <>
            Revisions
            {pendingRevisionsCount > 0 && !revisionsSeen ? (
              <Badge size="xs" mx="xs">
                {pendingRevisionsCount}
              </Badge>
            ) : null}
          </>
        }
        onToggle={() => setRevisionsSeen(true)}
      >
        {revisionAndActivityHistory}
      </RevisionHistoryBottomSheet>
    </>
  );
}
