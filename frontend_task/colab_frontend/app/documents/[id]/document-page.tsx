"use client";
import { getDocument } from "@/queries/get-document";
import { getDocumentActivity } from "@/queries/get-document-activity";
import { getDocumentRevisions } from "@/queries/get-document-revisions";
import { useSupabaseClient } from "@/utils/supabase/client";
import { useSupabaseQuery } from "@/utils/supabase/supabase-query";
import { Badge, Group, Stack, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Avataar } from "../components/avataar";
import { RevisionHistoryBottomSheet } from "./components/revision-history-bottomsheet";
import { RevisionHistoryDrawer } from "./components/revision-history-drawer";
import { RevisionHistoryTabs } from "./components/revision-history-tabs";
import { DeleteDocumentDialog } from "./components/delete-document-dialog";
import { EditDocumentDrawer } from "./components/edit-document-drawer";
import { NewRevisionDialog } from "./components/new-revision-dialog";
import { useSubscriptionQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { useRealtimeDocument } from "./hooks/use-realtime-document";

export default function DocumentPage() {
  const params = useParams();
  const supabase = useSupabaseClient();
  const documentId = params.id as string;

  const { data } = useSupabaseQuery(getDocument(supabase, { id: documentId }));
  const { data: revisions } = useSupabaseQuery(
    getDocumentRevisions(supabase, { id: documentId })
  );
  const { data: activities } = useSupabaseQuery(
    getDocumentActivity(supabase, { id: documentId })
  );
  const [revisionsSeen, setRevisionsSeen] = useState(false);
  const pendingRevisionsCount =
    revisions?.filter((revision) => revision.status === "PENDING").length || 0;

  useRealtimeDocument(documentId);

  const revisionHistory = useMemo(
    () => (
      <RevisionHistoryTabs
        revisions={revisions || []}
        activities={activities || []}
      />
    ),
    [revisions, activities]
  );

  if (!data) {
    return null;
  }

  return (
    <>
      <Stack>
        <Group justify="space-between" align="start">
          <Stack gap="xs">
            <Text size="xl">{data?.title}</Text>
            <Group>
              <Avataar email={data.author.email} />
              <Stack gap={0}>
                <Text size="sm">{data.author.email}</Text>
                <Text size="sm" color="dimmed">
                  updated: {new Date(data.updatedAt).toDateString()}
                </Text>
              </Stack>
            </Group>
          </Stack>
          <Group mt="xs">
            <NewRevisionDialog document={data} />
            <RevisionHistoryDrawer
              showIndicator={pendingRevisionsCount > 0 && !revisionsSeen}
              onToggle={() => setRevisionsSeen(true)}
            >
              {revisionHistory}
            </RevisionHistoryDrawer>
            <EditDocumentDrawer document={data} />
            <DeleteDocumentDialog documentId={documentId} />
          </Group>
        </Group>
        <Text>{data.content}</Text>
      </Stack>
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
        {revisionHistory}
      </RevisionHistoryBottomSheet>
    </>
  );
}
