import { forwardRef } from "react";
import { IconBuilding, IconChevronUp, IconLogout } from "@tabler/icons-react";
import {
  Avatar,
  Text,
  Menu,
  UnstyledButton,
  Group,
  Loader,
  Skeleton,
  Box,
} from "@mantine/core";
import { getInitialsFromEmail } from "@/utils/utils";
import { getUser } from "@/hooks/use-user";
import { Avataar } from "./avataar";
import { logout } from "@/app/(auth)/auth.actions";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  email: string;
  organizationName: string;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  function UserButton(
    { email, organizationName, ...others }: UserButtonProps,
    ref
  ) {
    return (
      <UnstyledButton
        ref={ref}
        style={{
          padding: "var(--mantine-spacing-md)",
          color: "var(--mantine-color-text)",
          borderRadius: "var(--mantine-radius-sm)",
          width: "100%",
        }}
        {...others}
      >
        <Group wrap="nowrap" justify="space-between" gap="xs">
          <Group
            wrap="nowrap"
            style={{ flex: "0 1 auto", minWidth: 0 }}
            gap="xs"
          >
            <Avataar email={email} />

            <Box style={{ minWidth: 0, overflow: "hidden" }}>
              <Text
                size="xs"
                fw={500}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <IconBuilding size={16} style={{ flexShrink: 0 }} />{" "}
                {organizationName}
              </Text>
              <Text
                c="dimmed"
                size="xs"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {email}
              </Text>
            </Box>
          </Group>

          <IconChevronUp size={16} style={{ flexShrink: 0 }} />
        </Group>
      </UnstyledButton>
    );
  }
);

export default function ProfileDropdown() {
  const { data } = getUser();

  return (
    <Menu withArrow>
      <Menu.Target>
        <UserButton
          email={data?.profile?.email ?? ""}
          organizationName={data?.profile?.organization?.name ?? ""}
        />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconLogout size={14} />} onClick={logout}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
