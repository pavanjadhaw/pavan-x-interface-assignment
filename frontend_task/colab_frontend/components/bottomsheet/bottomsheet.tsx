import { Box, Center, Button, Drawer, Flex, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";

interface BottomSheetProps {
  children: React.ReactNode;
  title: React.ReactNode;
  onToggle?: () => void;
}

export const BottomSheet = ({
  children,
  title,
  onToggle,
}: BottomSheetProps) => {
  const [drawerOpened, drawer] = useDisclosure(false);

  return (
    <>
      {!drawerOpened && (
        <Box
          hiddenFrom="sm"
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
            width: "100%",
            height: "40px",
            borderRadius: "8px 8px 0px 0px",
            boxShadow:
              "0px -10px 10px 0px rgba(0, 0, 0, 0.03), 0px 0px 10px 0px rgba(0, 0, 0, 0.03)",
            backgroundColor: "white",
          }}
        >
          <Center>
            <Button
              variant="transparent"
              style={{
                padding: "0px",
                margin: "0px",
                color: "var(--mantine-color-gray-7)",
                height: "40px",
                width: "100%",
              }}
              onClick={() => {
                drawer.toggle();
                onToggle?.();
              }}
            >
              {title}
              {!drawerOpened ? (
                <IconChevronUp size={24} stroke={1.5} />
              ) : (
                <IconChevronDown size={24} stroke={1.5} />
              )}
            </Button>
          </Center>
        </Box>
      )}

      <Drawer.Root
        hiddenFrom="sm"
        opened={drawerOpened}
        onClose={drawer.close}
        position="bottom"
        offset={0}
        radius="md"
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header p={0}>
            <Button
              variant="transparent"
              style={{
                height: "40px",
                padding: "0px",
                margin: "0px",
                color: "var(--mantine-color-gray-7)",
                width: "100%",
              }}
              onClick={drawer.toggle}
            >
              {title}
              {!drawerOpened ? (
                <IconChevronUp size={24} stroke={1.5} />
              ) : (
                <IconChevronDown size={24} stroke={1.5} />
              )}
            </Button>
          </Drawer.Header>
          <Drawer.Body>{children}</Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};
