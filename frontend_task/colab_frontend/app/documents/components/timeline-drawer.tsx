import { ActionIcon, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
      >
        {children}
      </Drawer>
    </>
  );
};
