import {
  Dialog,
  Text,
  Stack,
  Textarea,
  Flex,
  Button,
  ActionIcon,
  Tooltip,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { v4 as uuidv4 } from "uuid";
import {
  Document,
  DocumentActionType,
  DocumentActivity,
  Profile,
  Revision,
  RevisionStatus,
} from "@prisma/client";
import { IconTrash } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteMutation,
  useUpdateMutation,
} from "@supabase-cache-helpers/postgrest-react-query";
import { useSupabaseClient } from "@/utils/supabase/client";
import { TablesInsert, TablesUpdate } from "@/utils/supabase/types";
import { getUser } from "@/hooks/use-user";
import { useCreateActivity } from "@/mutations/useCreateActivity";

interface DeleteDocumentDialogProps {
  documentId: string;
}

export const DeleteDocumentDialog = ({
  documentId,
}: DeleteDocumentDialogProps) => {
  const { data: user } = getUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const isMobile = useMediaQuery(`(max-width: 48em)`);
  const [opened, { open, close }] = useDisclosure(false);

  const { mutateAsync: createActivity } = useCreateActivity(supabase);
  const { mutateAsync: updateDocument } = useUpdateMutation(
    supabase.from("Document"),
    ["id"],
    `
      id,
      title,
      content,
      createdAt,
      updatedAt,
      author:Profile (
        id,
        email
      ),
      revisionsCount:Revision (
        count
      )`,
    {
      disableAutoQuery: true,
    }
  );

  return (
    <>
      <Tooltip label="Delete document">
        <ActionIcon
          variant="default"
          aria-label="Settings"
          onClick={() => {
            if (opened) {
              close();
            } else {
              open();
            }
          }}
        >
          <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <Dialog
        opened={opened}
        withCloseButton
        onClose={close}
        size="lg"
        radius="md"
        {...(!isMobile && { position: { top: 120, right: 20 } })}
      >
        <Text size="sm" mb="xs" fw={500}>
          Delete document
        </Text>

        <Group justify="space-between" align="center">
          <Text size="sm">
            Are you sure you want to delete <br /> this document?
          </Text>
          <Button
            onClick={async () => {
              if (!user?.profile) {
                console.error("not signed in");
                return;
              }

              const updatedDocument: TablesUpdate<"Document"> = {
                id: documentId,
                deletedAt: new Date().toISOString(),
              };

              const updatedDocumentActivity: TablesInsert<"DocumentActivity"> =
                {
                  id: uuidv4(),
                  documentId,
                  organizationId: user.profile.organization.id,
                  actionType: DocumentActionType.UPDATED,
                  createdAt: new Date().toISOString(),
                  actorId: user.profile.id,
                };

              await updateDocument(updatedDocument);
              await createActivity([updatedDocumentActivity]);

              router.push("/documents");
            }}
            size="xs"
            style={{
              backgroundColor: "var(--mantine-color-red-6)",
              color: "var(--mantine-color-red-0)",
            }}
          >
            Confirm
          </Button>
        </Group>
      </Dialog>
    </>
  );
};
