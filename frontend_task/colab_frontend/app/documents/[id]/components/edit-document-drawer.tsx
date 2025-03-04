import {
  ActionIcon,
  Button,
  Drawer,
  Flex,
  Stack,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Document, DocumentActivity, Revision } from "@prisma/client";
import { IconEdit } from "@tabler/icons-react";
import { updateDocument } from "../../documents.actions";
import { useQueryClient } from "@tanstack/react-query";

interface EditDocumentDrawerProps {
  document: Document;
}

interface FormValues {
  title: string;
  content: string;
}

export const EditDocumentDrawer = ({ document }: EditDocumentDrawerProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      title: document.title,
      content: document.content,
    },

    validate: {
      title: (val) =>
        val.length <= 6 ? "Title should include at least 6 characters" : null,
      content: (val) =>
        val.length <= 6 ? "Content should include at least 6 characters" : null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    close();
    form.reset();

    // Store the current document data for potential rollback
    const currentDocument = queryClient.getQueryData([
      "documents",
      document.id,
    ]) as any;

    // Create an updated document with the new values
    const updatedDocument = {
      ...currentDocument,
      title: values.title,
      content: values.content,
      updatedAt: new Date(),
    };

    // Optimistically update the document in the cache
    queryClient.setQueryData(["documents", document.id], updatedDocument);

    // Also update the document in the documents list if it exists
    queryClient.setQueriesData({ queryKey: ["documents"] }, (oldData: any) => {
      if (!oldData || !oldData.documents) return oldData;

      return {
        ...oldData,
        documents: oldData.documents.map((doc: any) =>
          doc.id === document.id
            ? {
                ...doc,
                title: values.title,
                content: values.content,
                updatedAt: new Date(),
              }
            : doc
        ),
      };
    });

    try {
      await updateDocument({
        id: document.id,
        title: values.title,
        content: values.content,
      });

      // No need to invalidate queries since we've already updated the cache
      // and real-time subscriptions will handle any server-side changes
    } catch (error) {
      console.error("Failed to update document:", error);

      // Revert the optimistic updates on error
      if (currentDocument) {
        queryClient.setQueryData(["documents", document.id], currentDocument);
      }

      // Revert the document in the documents list
      queryClient.setQueriesData(
        { queryKey: ["documents"] },
        (oldData: any) => {
          if (!oldData || !oldData.documents) return oldData;

          return {
            ...oldData,
            documents: oldData.documents.map((doc: any) =>
              doc.id === document.id
                ? {
                    ...doc,
                    title: document.title,
                    content: document.content,
                    updatedAt: document.updatedAt,
                  }
                : doc
            ),
          };
        }
      );

      // Invalidate queries to refetch the latest data
      queryClient.invalidateQueries({
        queryKey: ["documents", document.id],
      });
    }
  };

  return (
    <>
      <Tooltip label="Edit document">
        <ActionIcon variant="default" aria-label="Settings" onClick={open}>
          <IconEdit style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <Drawer
        opened={opened}
        onClose={close}
        title="Update document"
        position="right"
        offset={8}
        radius="md"
      >
        <form
          onSubmit={form.onSubmit((values) => {
            if (
              values.title !== document.title ||
              values.content !== document.content
            ) {
              handleSubmit(values);
            }
          })}
        >
          <Stack>
            <TextInput
              required
              label="Title"
              placeholder="Title"
              value={form.values.title}
              onChange={(event) =>
                form.setFieldValue("title", event.currentTarget.value)
              }
              error={form.errors.email && "Invalid email"}
              radius="md"
            />

            <Textarea
              required
              label="Content"
              placeholder="Content"
              value={form.values.content}
              onChange={(event) =>
                form.setFieldValue("content", event.currentTarget.value)
              }
              error={form.errors.content && "Invalid content"}
              radius="md"
              autosize
              minRows={4}
            />

            <Flex justify="flex-end">
              <Button type="submit" radius="xl">
                Update
              </Button>
            </Flex>
          </Stack>
        </form>
      </Drawer>
    </>
  );
};
