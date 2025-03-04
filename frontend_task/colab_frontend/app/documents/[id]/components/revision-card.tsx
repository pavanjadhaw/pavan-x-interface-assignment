import {
  Paper,
  Stack,
  Group,
  Avatar,
  Box,
  Text,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import ActivityTime from "@/components/activity-time/activity-time";
import { getInitialsFromEmail } from "@/utils/utils";
import { Revision } from "@prisma/client";

interface RevisionCardProps {
  revision: Revision & {
    author: {
      email: string;
    };
  };
  onAccept: () => void;
  onReject: () => void;
}

export const RevisionCard: React.FC<RevisionCardProps> = ({
  revision,
  onAccept,
  onReject,
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
        <Group justify="space-between">
          <Group>
            <Avatar size={24} radius="xl" color="initials">
              {getInitialsFromEmail(revision.author.email)}
            </Avatar>
            <Box>
              <Text size="sm">{revision.author.email}</Text>
              <ActivityTime date={revision.updatedAt} />
            </Box>
          </Group>
          <Group gap={0}>
            <Tooltip label="Accept revision">
              <ActionIcon
                variant="transparent"
                aria-label="Accept"
                color="gray"
                onClick={onAccept}
              >
                <IconCheck size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Reject revision">
              <ActionIcon
                variant="transparent"
                aria-label="Reject"
                color="gray"
                onClick={onReject}
              >
                <IconX size={20} />
              </ActionIcon>
            </Tooltip>
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
      </Stack>
    </Paper>
  );
};
