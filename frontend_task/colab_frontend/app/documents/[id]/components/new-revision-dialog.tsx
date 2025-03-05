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
import { Dispatch, SetStateAction } from "react";
import { IconMessageCircle } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@/utils/supabase/client";
import { useInsertMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { TablesInsert } from "@/supabase/types";
import { GetDocumentResponse } from "@/queries/get-document";
import { getUser } from "@/hooks/use-user";
import { notifications } from "@mantine/notifications";

export interface NewRevisionDialogProps {
  document: GetDocumentResponse;
}

export function NewRevisionDialog({ document }: NewRevisionDialogProps) {
  const { data: user } = getUser();
  const isMobile = useMediaQuery(`(max-width: 48em)`);
  const [opened, { open, close }] = useDisclosure(false);
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();

  const { mutateAsync } = useInsertMutation(
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
        <form
          onSubmit={form.onSubmit(async (values) => {
            if (!user?.profile || !document) {
              console.error("you are not signed in");
              return;
            }

            const newRevision: TablesInsert<"Revision"> = {
              id: uuidv4(),
              content: values.content,
              status: "PENDING",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              authorId: user.profile.id,
              documentId: document.id,
            };

            await mutateAsync([newRevision]);

            notifications.show({
              title: "Revision created",
              message: "Revision created successfully",
              color: "green",
            });

            close();
            form.reset();
          })}
        >
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
