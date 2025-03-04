"use client";
import { useEffect, useState } from "react";
import { useRealtimeDocuments } from "@/app/documents/hooks/use-realtime-documents";
import useUser from "@/hooks/use-user";
import {
  Box,
  Button,
  Container,
  Flex,
  ScrollArea,
  Title,
  LoadingOverlay,
  Group,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTransition } from "react";
import { ActivityTimeline } from "./components/activity-timeline";
import { NewDocumentDrawer } from "./components/new-document-drawer";
import { TimelineBottomSheet } from "./components/timeline-bottomsheet";
import { useRouter } from "next/navigation";
import { TimelineDrawer } from "./components/timeline-drawer";
import {
  queryKeys,
  useUserProfile,
  useDocuments,
  useLoadMoreDocuments,
  useDocumentActivities,
  DocumentWithAuthor,
  DocumentActivityWithRelations,
} from "@/app/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { DocumentsTable } from "./components/documents-table";

export type DocumentsPageProps = {
  initialDocuments: DocumentWithAuthor[];
  initialDocumentActivities: DocumentActivityWithRelations[];
  initialNextCursor?: string | null;
};

export default function DocumentsPage({
  initialDocuments,
  initialDocumentActivities,
  initialNextCursor = null,
}: DocumentsPageProps) {
  const isMobile = useMediaQuery(`(max-width: 48em)`);
  const { profile } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  // Hydrate the query cache with initial data
  useEffect(() => {
    if (initialDocuments.length > 0 && profile?.organizationId) {
      queryClient.setQueryData(
        [queryKeys.documents, profile.organizationId, 10],
        {
          documents: initialDocuments,
          nextCursor: initialNextCursor,
        }
      );

      queryClient.setQueryData(
        [queryKeys.documentActivities, profile.organizationId, 10],
        {
          activities: initialDocumentActivities,
        }
      );
    }
  }, [
    initialDocuments,
    initialDocumentActivities,
    initialNextCursor,
    profile?.organizationId,
    queryClient,
  ]);

  // Get user profile
  const { data: userData, isLoading: userLoading } = useUserProfile();

  // Get documents
  const {
    data: documentsData,
    isLoading: isDocumentsLoading,
    isFetching: isDocumentsFetching,
  } = useDocuments(profile?.organizationId || "", 10);

  // Get document activities
  const { data: activitiesData, isLoading: isActivitiesLoading } =
    useDocumentActivities(profile?.organizationId || "", 10);

  // Only enable the mutation if we have a profile
  const loadMoreMutation = useLoadMoreDocuments(
    profile?.organizationId || "",
    10
  );

  // Enable realtime updates if we have an organization ID
  useRealtimeDocuments({
    organizationId: profile?.organizationId,
    enabled: !!profile?.organizationId,
  });

  // Prefetch document details when hovering over a row
  const prefetchDocument = (id: string) => {
    router.prefetch(`/documents/${id}`);
  };

  // Load more documents
  const handleLoadMore = () => {
    if (!documentsData?.nextCursor || loadMoreMutation.isPending) {
      console.log("Cannot load more:", {
        nextCursor: documentsData?.nextCursor,
        isPending: loadMoreMutation.isPending,
      });
      return;
    }

    console.log("Loading more with cursor:", documentsData.nextCursor);
    loadMoreMutation.mutate(documentsData.nextCursor);
  };

  // Get documents from query or fall back to initial documents
  const documents = documentsData?.documents || initialDocuments;

  // Get activities from query or fall back to initial activities
  const activities = activitiesData?.activities || initialDocumentActivities;

  // Create timeline component
  const timeline = <ActivityTimeline activities={activities} />;

  // Only show loading overlay if we don't have any documents to display
  const showLoading =
    (isDocumentsLoading || isDocumentsFetching) && documents.length === 0;

  return (
    <>
      <Container size="lg" py="xl">
        <Flex justify="space-between" align="center" mb="lg">
          <Title order={2}>Documents</Title>
          <Group justify="flex-end">
            {profile && <NewDocumentDrawer profile={profile} />}
            {!isMobile && <TimelineDrawer>{timeline}</TimelineDrawer>}
          </Group>
        </Flex>

        <Flex
          direction={isMobile ? "column" : "row"}
          gap={isMobile ? "md" : "xl"}
        >
          <Box style={{ flex: 1, position: "relative" }}>
            <LoadingOverlay visible={showLoading} />
            <ScrollArea>
              <DocumentsTable documents={documents} onEdit={prefetchDocument} />

              {documentsData?.nextCursor && (
                <Flex justify="center" mt="md" mb="xl">
                  <Button
                    onClick={handleLoadMore}
                    loading={loadMoreMutation.isPending}
                    variant="light"
                  >
                    Load More
                  </Button>
                </Flex>
              )}
            </ScrollArea>
          </Box>
        </Flex>
      </Container>
      {isMobile && <TimelineBottomSheet>{timeline}</TimelineBottomSheet>}
    </>
  );
}
