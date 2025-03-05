import { getUser } from "@/hooks/use-user";
import { useCreateActivity } from "@/mutations/useCreateActivity";
import { GetDocumentResponse } from "@/queries/get-document";
import { TablesInsert } from "@/supabase/types";
import { useSupabaseClient } from "@/utils/supabase/client";
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
import { notifications } from "@mantine/notifications";
import { DocumentActionType } from "@prisma/client";
import { useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { use } from "react";
import { IconEdit } from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import { U } from "@faker-js/faker/dist/airline-BXaRegOM";
import { TablesUpdate } from "@/utils/supabase/types";

interface EditDocumentDrawerProps {
  document: NonNullable<GetDocumentResponse>;
}

export const EditDocumentDrawer = ({ document }: EditDocumentDrawerProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: user } = getUser();
  const supabase = useSupabaseClient();

  const { mutateAsync: createActivity } = useCreateActivity(supabase);
  const { mutateAsync: updateDocument, isPending } = useUpdateMutation(
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
          onSubmit={form.onSubmit(async (values) => {
            if (!user?.profile) {
              console.error("not signed in");
              return;
            }

            if (
              values.title !== document.title ||
              values.content !== document.content
            ) {
              const documentId = document.id;
              const authorId = user.profile.id;
              const organizationId = user.profile.organization.id;

              const updatedDocument: TablesUpdate<"Document"> = {
                id: documentId,
                title: values.title,
                content: values.content,
              };

              const updatedDocumentActivity: TablesInsert<"DocumentActivity"> =
                {
                  id: uuidv4(),
                  documentId,
                  organizationId,
                  actionType: DocumentActionType.UPDATED,
                  createdAt: new Date().toISOString(),
                  actorId: authorId,
                };

              await updateDocument(updatedDocument);

              close();
              notifications.show({
                title: "Document updated",
                message: "Document updated successfully",
                color: "green",
              });

              await createActivity([updatedDocumentActivity]);
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
              <Button
                type="submit"
                radius="xl"
                disabled={isPending}
                loading={isPending}
              >
                Update
              </Button>
            </Flex>
          </Stack>
        </form>
      </Drawer>
    </>
  );
};
