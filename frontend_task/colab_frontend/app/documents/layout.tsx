"use client";
import {
  AppShell,
  Group,
  Burger,
  Skeleton,
  Button,
  Stack,
  NavLink,
  rem,
  Loader,
} from "@mantine/core";
import logo from "@/public/logo.webp";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  IconArrowsLeftRight,
  IconBuilding,
  IconChevronUp,
  IconFileDescription,
  IconLogout,
  IconTrash,
} from "@tabler/icons-react";
import { theme } from "@/theme";
// import ProfileDropdown from "@/components/profile-dropdown/profile-dropdown";
import Link from "next/link";
import ProfileDropdown from "./components/profile-dropdown";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  return (
    <AppShell
      header={{ height: 40 }}
      navbar={{ width: 200, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Link href="/documents">
            <Image
              src={logo}
              alt="logo"
              width={100}
              style={{ filter: "invert(1)" }}
            />
          </Link>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <NavLink
          leftSection={
            <IconFileDescription
              style={{ width: rem(25), height: rem(25) }}
              stroke={1.5}
            />
          }
          href="/documents"
          label="Documents"
          active={pathname === "/documents"}
          style={{
            backgroundColor: "var(--mantine-color-gray-1)",
            color: "var(--mantine-color-gray-8)",
            fontWeight: "bold",
          }}
        />
        <ProfileDropdown />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
