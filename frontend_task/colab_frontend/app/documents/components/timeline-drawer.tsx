import { useForm } from "@mantine/form";
import {
  Stack,
  TextInput,
  Textarea,
  Button,
  Flex,
  Drawer,
  ActionIcon,
} from "@mantine/core";
import { v4 as uuidv4 } from "uuid";
import {
  Document,
  DocumentActivity,
  DocumentActionType,
  Profile,
} from "@prisma/client";
import { createDocument } from "../documents.actions";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { DocumentPageProps } from "../[id]/document";
import { DocumentsPageProps } from "../documents";
import { IconHistory } from "@tabler/icons-react";

interface TimelineDrawerProps {
  children: React.ReactNode;
}

export const TimelineDrawer = ({ children }: TimelineDrawerProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ActionIcon onClick={open} variant="light" visibleFrom="sm">
        <IconHistory style={{ width: "70%", height: "70%" }} />
      </ActionIcon>
      <Drawer
        opened={opened}
        onClose={close}
        title="Activity log"
        position="right"
        offset={8}
        radius="md"
        size="xs"
      >
        {children}
      </Drawer>
    </>
  );
};
