import { Timeline, Avatar, Text, Box, Flex } from "@mantine/core";
import Link from "next/link";
import { getDocumentActivityDescription } from "@/utils/utils";
import { TimeAgo } from "./timeago";
import { Avataar } from "./avataar";

interface ActivityTimelineProps {
  activities: {
    id: string;
    document: {
      id: string;
      title: string;
    };
    actor: {
      id: string;
      email: string;
    };
    createdAt: string;
  }[];
}

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  if (!activities) return null;

  return (
    <Flex justify="flex-end" mt="sm">
      <Box style={{ width: "fit-content" }}>
        <Timeline align="right">
          {activities.map((activity) => (
            <Timeline.Item
              key={activity.id}
              // @TODO: fix avatar size
              bullet={<Avataar email={activity.actor.email} />}
            >
              <Text size="sm">
                {getDocumentActivityDescription(activity)}
                <br />
                <Link
                  href={`/documents/${activity.document.id}`}
                  style={{
                    textDecoration: "underline",
                    color: "var(--mantine-color-gray-8)",
                    textUnderlineOffset: 2,
                  }}
                >
                  {activity.document.title.length > 40
                    ? `${activity.document.title.slice(0, 40)}...`
                    : activity.document.title}
                </Link>
              </Text>
              <TimeAgo size="sm" c="dimmed" date={activity.createdAt} />
            </Timeline.Item>
          ))}
        </Timeline>
      </Box>
    </Flex>
  );
};
