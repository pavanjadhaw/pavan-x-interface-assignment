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
import { getInitialsFromEmail, getUsernameFromEmail } from "@/utils/utils";
import { Revision, RevisionStatus } from "@prisma/client";
import { TimeAgo } from "../../components/timeago";
import { GetDocumentRevisionsResponse } from "@/queries/get-document-revisions";
import { InferArrayElement } from "@/types";
import { getUser } from "@/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@/utils/supabase/client";
import { useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { TablesUpdate } from "@/supabase/types";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

interface RevisionCardProps {
  revision: InferArrayElement<GetDocumentRevisionsResponse>;
}

export const RevisionCard: React.FC<RevisionCardProps> = ({ revision }) => {
  const { data: user } = getUser();
  const supabase = useSupabaseClient();
  const [currentStatus, setCurrentStatus] = useState<RevisionStatus | null>(
    null
  );

  const { mutateAsync: updateRevision, isPending } = useUpdateMutation(
    supabase.from("Revision"),
    ["id"],
    `
      id,
      content,
      status,
      createdAt,
      updatedAt,
      author:Profile (
        id,
        email
      ),
      activities:RevisionActivity (
        id,
        actionType,
        createdAt,
        actor:Profile (
          id,
          email
        )
      )
    `
  );

  const revisionStatusHandler = async (status: RevisionStatus) => {
    if (!user?.profile || !document) {
      console.error("you are not signed in");
      return;
    }

    setCurrentStatus(status);

    const revisionUpdates: TablesUpdate<"Revision"> = {
      id: revision.id,
      status,
    };

    await updateRevision(revisionUpdates);

    if (status === RevisionStatus.ACCEPTED) {
      notifications.show({
        message: null,
        title: "Revision accepted",
        color: "green",
      });
    } else {
      notifications.show({
        message: null,
        title: "Revision rejected",
        color: "red",
      });
    }

    setCurrentStatus(null);
  };

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
              <Text size="sm">
                {getUsernameFromEmail(revision.author.email)}
              </Text>
              <TimeAgo size="xs" c="dimmed" date={revision.updatedAt} />
            </Box>
          </Group>
          <Group gap={0}>
            <Tooltip label="Accept revision">
              <ActionIcon
                variant="transparent"
                aria-label="Accept"
                color="gray"
                onClick={() => revisionStatusHandler(RevisionStatus.ACCEPTED)}
                disabled={isPending}
                loading={isPending && currentStatus === RevisionStatus.ACCEPTED}
              >
                <IconCheck size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Reject revision">
              <ActionIcon
                variant="transparent"
                aria-label="Reject"
                color="gray"
                onClick={() => revisionStatusHandler(RevisionStatus.REJECTED)}
                disabled={
                  isPending && currentStatus === RevisionStatus.REJECTED
                }
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
