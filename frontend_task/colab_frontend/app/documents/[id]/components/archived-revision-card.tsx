import { Paper, Stack, Group, Avatar, Box, Text } from "@mantine/core";
import ActivityTime from "@/components/activity-time/activity-time";
import { getInitialsFromEmail } from "@/utils/utils";
import { Revision, RevisionStatus } from "@prisma/client";

interface ArchivedRevisionCardProps {
  revision: Revision & {
    author: {
      email: string;
    };
  };
}

export const ArchivedRevisionCard: React.FC<ArchivedRevisionCardProps> = ({
  revision,
}) => {
  return (
    <Paper
      key={revision.id}
      shadow="xs"
      p="md"
      radius="md"
      style={{
        backgroundColor: "var(--mantine-color-gray-1)",
        maxWidth: "320px",
        minWidth: "260px",
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size={24} radius="xl" color="initials">
              {getInitialsFromEmail(revision.author.email)}
            </Avatar>
            <Box>
              <Text size="sm">{revision.author.email}</Text>
              <ActivityTime date={revision.updatedAt} />
            </Box>
          </Group>
        </Group>
        <Text
          size="sm"
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {revision.content}
        </Text>
        <Group gap={0} justify="flex-end">
          {revision.status === RevisionStatus.ACCEPTED && (
            <Text size="xs" c="dimmed">
              Accepted
            </Text>
          )}
          {revision.status === RevisionStatus.REJECTED && (
            <Text size="xs" c="dimmed">
              Rejected
            </Text>
          )}
        </Group>
      </Stack>
    </Paper>
  );
};
