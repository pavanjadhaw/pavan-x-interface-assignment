import { useEffect, useState } from "react";
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
import { useDisclosure } from "@mantine/hooks";
import { v4 as uuidv4 } from "uuid";
import { useInsertMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { useSupabaseClient } from "@/utils/supabase/client";
import { getUser } from "@/hooks/use-user";
import { TablesInsert } from "@/utils/supabase/types";
import { DocumentActionType } from "@prisma/client";
import { useCreateActivity } from "@/mutations/useCreateActivity";

export function NewDocumentDrawer() {
  const { data: user } = getUser();
  const [opened, { open, close }] = useDisclosure(false);
  const supabase = useSupabaseClient();

  const { mutateAsync: createActivity } = useCreateActivity(supabase);
  const { mutateAsync: createDocument, isPending } = useInsertMutation(
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
      )`
  );

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
        <form
          onSubmit={form.onSubmit(async (values) => {
            if (!user?.profile) {
              console.error("you are not signed in");
              return;
            }

            const id = uuidv4();
            const authorId = user.profile.id;
            const organizationId = user.profile.organization.id;

            const newDocument: TablesInsert<"Document"> = {
              id,
              authorId,
              organizationId,
              title: values.title,
              content: values.content,
              updatedAt: new Date().toISOString(),
            };

            const newDocumentActivity: TablesInsert<"DocumentActivity"> = {
              id: uuidv4(),
              actionType: DocumentActionType.CREATED,
              createdAt: new Date().toISOString(),
              actorId: authorId,
              documentId: id,
              organizationId,
            };

            await createDocument([newDocument]);

            close();
            form.reset();

            notifications.show({
              title: newDocument.title,
              message: `has been created successfully`,
              color: "green",
              icon: <IconCheck size="1.1rem" />,
            });

            await createActivity([newDocumentActivity]);
          })}
        >
          <Stack>
            <TextInput
              label="Title"
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

            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={() => {
                  close();
                  form.reset();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isPending}>
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Drawer>
    </>
  );
}
