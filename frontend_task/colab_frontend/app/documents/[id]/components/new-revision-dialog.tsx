import {
  Dialog,
  Text,
  Stack,
  Textarea,
  Flex,
  Button,
  ActionIcon,
  Tooltip,
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
import { createRevision } from "../../documents.actions";
import { Dispatch, SetStateAction } from "react";
import { IconMessageCircle } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";

export interface NewRevisionDialogProps {
  profile: Profile;
  document: Document;
}

export function NewRevisionDialog({
  profile,
  document,
}: NewRevisionDialogProps) {
  const isMobile = useMediaQuery(`(max-width: 48em)`);
  const [opened, { open, close }] = useDisclosure(false);
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      content: "",
    },
    validate: {
      content: (val) =>
        val.length <= 6
          ? "Revision should include at least 6 characters"
          : null,
    },
  });

  const handleSubmit = async (values: { content: string }) => {
    const id = uuidv4();
    close();
    form.reset();

    // Create the optimistic revision
    const optimisticRevision = {
      id,
      documentId: document.id,
      content: values.content,
      status: RevisionStatus.PENDING,
      authorId: profile.id,
      author: {
        id: profile.id,
        email: profile.email,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      activities: [],
    };

    // Get the current document data from the cache
    const currentDocument = queryClient.getQueryData([
      "documents",
      document.id,
    ]) as any;

    // Optimistically update the document in the cache
    if (currentDocument) {
      queryClient.setQueryData(["documents", document.id], {
        ...currentDocument,
        revisions: [optimisticRevision, ...(currentDocument.revisions || [])],
      });
    }

    try {
      await createRevision({
        id,
        documentId: document.id,
        content: values.content,
      });

      // No need to invalidate the query since we've already updated the cache
      // and the real-time subscription will handle any server-side changes
    } catch (error) {
      console.error("Failed to create revision:", error);

      // Revert the optimistic update on error
      if (currentDocument) {
        queryClient.setQueryData(["documents", document.id], currentDocument);
      }

      // Invalidate the query to refetch the latest data
      queryClient.invalidateQueries({
        queryKey: ["documents", document.id],
      });
    }
  };

  return (
    <>
      <Tooltip label="Add revision">
        <ActionIcon
          variant="default"
          aria-label="Add revision"
          onClick={() => {
            if (opened) {
              close();
            } else {
              open();
            }
          }}
        >
          <IconMessageCircle
            style={{ width: "70%", height: "70%" }}
            stroke={1.5}
          />
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
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Text size="sm" mb="xs" fw={500}>
            Add revision
          </Text>
          <Stack>
            <Textarea
              name="content"
              placeholder="Revision"
              onChange={(event) =>
                form.setFieldValue("content", event.currentTarget.value)
              }
              error={form.errors.content}
              autosize
              minRows={2}
            />
            <Flex justify="flex-end">
              <Button type="submit" size="xs">
                Create
              </Button>
            </Flex>
          </Stack>
        </form>
      </Dialog>
    </>
  );
}
