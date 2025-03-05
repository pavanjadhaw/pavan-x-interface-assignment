import { GetDocumentActivityResponse } from "@/queries/get-document-activity";
import { GetDocumentRevisionsResponse } from "@/queries/get-document-revisions";
import { InferArrayElement } from "@/types";
import {
  Badge,
  Box,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import {
  IconHistory,
  IconMessageCircle,
  IconMessageCircleDown,
} from "@tabler/icons-react";
import { ActivityTimeline } from "../../components/activity-timeline";
import { ArchivedRevisionCard } from "./archived-revision-card";
import { RevisionCard } from "./revision-card";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

export interface RevisionHistoryTabsProps {
  revisions: InferArrayElement<GetDocumentRevisionsResponse>[];
  activities: InferArrayElement<GetDocumentActivityResponse>[];
}

export const RevisionHistoryTabs: React.FC<RevisionHistoryTabsProps> = ({
  revisions,
  activities,
}) => {
  const isMobile = useMediaQuery(`(max-width: 48em)`);
  const pending = revisions.filter((revision) => revision.status === "PENDING");
  const archived = revisions.filter(
    (revision) => revision.status !== "PENDING"
  );

  return (
    <>
      <Tabs defaultValue="pending">
        <Tabs.List justify="flex-end" grow>
          <Tabs.Tab
            value="pending"
            leftSection={<IconMessageCircleDown size={12} />}
          >
            Pending
          </Tabs.Tab>
          <Tabs.Tab
            value="revisions"
            leftSection={<IconMessageCircle size={12} />}
          >
            Revisions
          </Tabs.Tab>
          <Tabs.Tab value="activity" leftSection={<IconHistory size={12} />}>
            Activity
          </Tabs.Tab>
        </Tabs.List>

        <ScrollArea.Autosize
          overscrollBehavior="contain"
          h={isMobile ? "320px" : "calc(100vh - 140px)"}
          offsetScrollbars="y"
          type="never"
        >
          <Tabs.Panel value="pending">
            <Group justify="flex-end" mt="md">
              <Stack style={{ width: "fit-content" }}>
                {pending.map((revision) => (
                  <RevisionCard key={revision.id} revision={revision} />
                ))}
              </Stack>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="revisions">
            <Group justify="flex-end" mt="md">
              <Stack style={{ width: "fit-content" }}>
                {archived.map((revision) => (
                  <ArchivedRevisionCard key={revision.id} revision={revision} />
                ))}
              </Stack>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="activity">
            <Group justify="flex-end" mt="md">
              <Box style={{ width: "fit-content" }}>
                <ActivityTimeline activities={activities} />
              </Box>
            </Group>
          </Tabs.Panel>
        </ScrollArea.Autosize>
      </Tabs>
    </>
  );
};
