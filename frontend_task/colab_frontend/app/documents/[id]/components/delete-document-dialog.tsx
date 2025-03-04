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
  DocumentActivity,
  Profile,
  Revision,
  RevisionStatus,
} from "@prisma/client";
import { deleteDocument } from "../../documents.actions";
import { IconTrash } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteDocumentDialogProps {
  document: Document & {
    revisions: (Revision & {
      author: {
        id: string;
        email: string;
      };
    })[];
  };
}

export const DeleteDocumentDialog = ({
  document,
}: DeleteDocumentDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isMobile = useMediaQuery(`(max-width: 48em)`);
  const [opened, { open, close }] = useDisclosure(false);

  const handleDelete = async () => {
    close();

    try {
      await deleteDocument({ id: document.id });

      // Remove the document from the cache
      queryClient.removeQueries({
        queryKey: ["documents", document.id],
      });

      // Navigate back to documents list
      router.push("/documents");
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

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
            onClick={handleDelete}
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
