import { ActionIcon, Drawer, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHistory } from "@tabler/icons-react";

interface RevisionHistoryDrawerProps {
  children: React.ReactNode;
}

export const RevisionHistoryDrawer = ({
  children,
}: RevisionHistoryDrawerProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Tooltip label="Revision & Activity Log">
        <ActionIcon
          variant="default"
          aria-label="History"
          onClick={open}
          visibleFrom="sm"
        >
          <IconHistory style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
      <Drawer
        opened={opened}
        onClose={close}
        title="Revision & Activity Log"
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
