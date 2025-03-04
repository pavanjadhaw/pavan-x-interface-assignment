import { useState } from "react";
import {
  Drawer,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, DocumentWithAuthor } from "@/app/hooks/useQueries";
import { useDisclosure } from "@mantine/hooks";
import { createDocument } from "@/app/documents/documents.actions";
import { v4 as uuidv4 } from "uuid";
import { Profile } from "@/hooks/use-user";

interface NewDocumentDrawerProps {
  profile: Profile;
}

export function NewDocumentDrawer({ profile }: NewDocumentDrawerProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      title: "",
      content: "",
    },
    validate: {
      title: (val) =>
        val.length <= 6 ? "Title should include at least 6 characters" : null,
      content: (val) =>
        val.length <= 6 ? "Content should include at least 6 characters" : null,
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (values: { title: string; content: string }) => {
      const documentId = uuidv4();
      await createDocument({
        id: documentId,
        title: values.title,
        content: values.content,
      });

      return {
        document: {
          id: documentId,
          title: values.title,
          content: values.content,
          updatedAt: new Date(),
        },
      };
    },
    onSuccess: (data) => {
      // Create a new document object with the author information
      const newDocument: DocumentWithAuthor = {
        ...data.document,
        author: {
          email: profile.email || "",
        },
        _count: {
          revisions: 0,
        },
      };

      // Update the query cache
      queryClient.setQueriesData(
        { queryKey: [queryKeys.documents, profile.organizationId] },
        (oldData: any) => {
          if (!oldData) return oldData;

          // Handle both regular and infinite queries
          if (oldData.documents) {
            return {
              ...oldData,
              documents: [newDocument, ...oldData.documents],
            };
          }

          return oldData;
        }
      );

      // Show success notification
      notifications.show({
        title: "Document created",
        message: `${data.document.title} has been created successfully`,
        color: "green",
        icon: <IconCheck size="1.1rem" />,
      });

      // Close the drawer and reset the form
      close();
      form.reset();
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSubmit = async (values: { title: string; content: string }) => {
    setLoading(true);
    createDocumentMutation.mutate(values);
  };

  return (
    <>
      <Button size="xs" onClick={open}>
        New document
      </Button>
      <Drawer
        opened={opened}
        onClose={() => {
          close();
          form.reset();
        }}
        title="Create New Document"
        position="right"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Document Title"
              placeholder="Enter document title"
              required
              radius="md"
              {...form.getInputProps("title")}
            />

            <Textarea
              required
              label="Content"
              placeholder="Content"
              radius="md"
              autosize
              minRows={4}
              {...form.getInputProps("content")}
            />

            <Text size="sm" c="dimmed">
              This will create a new document in your organization.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={() => {
                  close();
                  form.reset();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Document
              </Button>
            </Group>
          </Stack>
        </form>
      </Drawer>
    </>
  );
}
