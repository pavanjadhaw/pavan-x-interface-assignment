import {
  Tabs,
  ScrollArea,
  Group,
  Box,
  Avatar,
  Text,
  Timeline,
} from "@mantine/core";
import {
  IconMessageCircleDown,
  IconMessageCircle,
  IconHistory,
} from "@tabler/icons-react";
import { Document, DocumentActivity } from "@prisma/client";
import ActivityTime from "@/components/activity-time/activity-time";
import {
  getInitialsFromEmail,
  getDocumentActivityDescription,
} from "@/utils/utils";
import Link from "next/link";
import { ReactElement } from "react";
import { useMediaQuery } from "@mantine/hooks";

interface RevisionHistoryTabsProps {
  isMobile: boolean;
  document: Document & {
    activities: (DocumentActivity & {
      actor: {
        email: string;
      };
    })[];
  };
  pendingRevisions: ReactElement;
  archivedRevisions: ReactElement;
}

export const RevisionHistoryTabs: React.FC<RevisionHistoryTabsProps> = ({
  isMobile,
  document,
  pendingRevisions,
  archivedRevisions,
}) => {
  return (
    <Tabs defaultValue={isMobile ? "pending" : "revisions"}>
      <Tabs.List justify="flex-end" grow>
        <Tabs.Tab
          value="pending"
          leftSection={<IconMessageCircleDown size={12} />}
          hiddenFrom="sm"
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

      <ScrollArea
        h={isMobile ? "320px" : "82vh"}
        scrollbars="y"
        offsetScrollbars="y"
        type="never"
      >
        <Tabs.Panel value="pending">
          <Group justify="flex-end" mt="md">
            <Box style={{ width: "fit-content" }}>{pendingRevisions}</Box>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="revisions">
          <Group justify="flex-end" mt="md">
            <Box style={{ width: "fit-content" }}>{archivedRevisions}</Box>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <Group justify="flex-end" mt="md">
            <Box style={{ width: "fit-content" }}>
              <Timeline align="right">
                {document.activities.map((activity) => (
                  <Timeline.Item
                    key={activity.id}
                    bullet={
                      <Avatar size={24} radius="xl" color="initials">
                        {getInitialsFromEmail(activity.actor.email)}
                      </Avatar>
                    }
                  >
                    <Text size="xs" c="dimmed" style={{ maxWidth: "200px" }}>
                      {getDocumentActivityDescription({
                        ...activity,
                        document: {
                          title: document.title,
                        },
                      })}{" "}
                      <Link
                        href={`/documents/${activity.documentId}`}
                        style={{
                          textDecoration: "underline",
                          color: "var(--mantine-color-gray-8)",
                          textUnderlineOffset: 2,
                        }}
                      >
                        {document.title}
                      </Link>
                    </Text>
                    <ActivityTime date={activity.createdAt} />
                  </Timeline.Item>
                ))}
              </Timeline>
            </Box>
          </Group>
        </Tabs.Panel>
      </ScrollArea>
    </Tabs>
  );
};
