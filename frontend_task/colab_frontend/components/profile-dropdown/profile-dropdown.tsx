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
import { logout } from "@/app/(auth)/auth.actions";
import useUser from "@/hooks/use-user";
import { getInitialsFromEmail } from "@/utils/utils";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  loading: boolean;
  email: string;
  organizationName: string;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  function UserButton(
    { email, organizationName, loading, ...others }: UserButtonProps,
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
            <Avatar size={24} radius="xl" color="initials">
              {loading ? <Loader size={16} /> : getInitialsFromEmail(email)}
            </Avatar>

            <Box style={{ minWidth: 0, overflow: "hidden" }}>
              {loading ? (
                <>
                  <Skeleton height={16} width={100} mb={4} />
                  <Skeleton height={12} width={100} />
                </>
              ) : (
                <>
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
                </>
              )}
            </Box>
          </Group>

          <IconChevronUp size={16} style={{ flexShrink: 0 }} />
        </Group>
      </UnstyledButton>
    );
  }
);

export default function ProfileDropdown() {
  const { user, profile, loading } = useUser();

  return (
    <Menu withArrow>
      <Menu.Target>
        <UserButton
          loading={loading}
          email={user?.email ?? ""}
          organizationName={profile?.organization.name ?? ""}
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
