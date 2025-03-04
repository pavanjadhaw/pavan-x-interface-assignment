import { Timeline, Avatar, Text, Box, Flex } from "@mantine/core";
import Link from "next/link";
import ActivityTime from "@/components/activity-time/activity-time";
import {
  getInitialsFromEmail,
  getDocumentActivityDescription,
} from "@/utils/utils";
import { DocumentActivity } from "@prisma/client";
import { DocumentActivityWithRelations } from "@/app/hooks/useQueries";

interface ActivityTimelineProps {
  activities: DocumentActivityWithRelations[];
}

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  return (
    <Flex justify="flex-end">
      <Box style={{ width: "fit-content" }}>
        <Timeline align="right">
          {activities.map((activity) => (
            <Timeline.Item
              key={activity.id}
              bullet={
                <Avatar size={24} radius="xl" color="initials">
                  {getInitialsFromEmail(activity.actor.email)}
                </Avatar>
              }
            >
              <Text size="xs" c="dimmed" style={{ maxWidth: "200px" }}>
                {getDocumentActivityDescription(activity)}{" "}
                <Link
                  href={`/documents/${activity.documentId}`}
                  style={{
                    textDecoration: "underline",
                    color: "var(--mantine-color-gray-8)",
                    textUnderlineOffset: 2,
                  }}
                >
                  {activity.document.title}
                </Link>
              </Text>
              <ActivityTime date={activity.createdAt} />
            </Timeline.Item>
          ))}
        </Timeline>
      </Box>
    </Flex>
  );
};
