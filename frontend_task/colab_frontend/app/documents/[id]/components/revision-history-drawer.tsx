import { ActionIcon, Drawer, Indicator, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHistory } from "@tabler/icons-react";
import { RevisionHistoryTabs } from "./revision-history-tabs";

interface RevisionHistoryDrawerProps {
  children: React.ReactNode;
  showIndicator?: boolean;
  onToggle?: () => void;
}

export const RevisionHistoryDrawer = ({
  children,
  showIndicator = false,
  onToggle,
}: RevisionHistoryDrawerProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Tooltip label="Revision & Activity Log">
        <Indicator
          inline
          size={12}
          withBorder
          processing
          disabled={!showIndicator}
        >
          <ActionIcon
            variant="default"
            aria-label="History"
            onClick={() => {
              onToggle?.();
              open();
            }}
            visibleFrom="sm"
          >
            <IconHistory style={{ width: "70%", height: "70%" }} stroke={1.5} />
          </ActionIcon>
        </Indicator>
      </Tooltip>
      <Drawer
        opened={opened}
        onClose={close}
        title="Revision & Activity Log"
        position="right"
        offset={8}
        radius="md"
        size="sm"
      >
        {children}
      </Drawer>
    </>
  );
};
