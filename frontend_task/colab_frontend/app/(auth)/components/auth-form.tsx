"use client";
import {
  Anchor,
  Box,
  Button,
  Center,
  Checkbox,
  CheckIcon,
  ComboboxItem,
  Container,
  Divider,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import Image from "next/image";
import logo from "@/public/logo.webp";
import { IconCircleCheck } from "@tabler/icons-react";
import { login, signup } from "../auth.actions";
import { Organization, Profile } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseQuery } from "@/utils/supabase/supabase-query";
import { getDemoAccounts } from "@/queries/get-demo-accounts";
import { useSupabaseClient } from "@/utils/supabase/client";

type AuthFormProps = {
  type: "login" | "signup";
};

export default function AuthenticationForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [demoAccount, setDemoAccount] = useState<ComboboxItem | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = useSupabaseClient();
  const { data: organizations } = useSupabaseQuery(getDemoAccounts(supabase));

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      organization: "",
    },

    validate: {
      email: (val) =>
        /^\S+@\S+$/.test(val) ? null : "Please enter a valid email address",
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
      organization: (val) =>
        type === "signup"
          ? val.length <= 3
            ? "Organization name should include at least 3 characters"
            : null
          : null,
    },
  });

  const demoAccounts =
    organizations
      ?.filter((org) => org.users.length > 1)
      .slice(0, 2)
      .map((org) => ({
        group: org.name,
        items: org.users.map((user) => user.email),
      })) || [];

  useEffect(() => {
    if (demoAccount) {
      form.setFieldValue("email", demoAccount.value);
      form.setFieldValue("password", "password123");
    } else {
      form.setFieldValue("email", "");
      form.setFieldValue("password", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoAccount]);

  return (
    <Box style={{ height: "100%", width: "100%", backgroundColor: "#f3f4f0" }}>
      <Container size="md" h="100vh">
        <Center h="100%">
          <Box display="flex">
            <Center>
              <Box
                visibleFrom="sm"
                style={{
                  padding: "20px",
                  maxWidth: "320px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <Center>
                  <Image
                    src={logo}
                    alt="logo"
                    width={100}
                    style={{ filter: "invert(1)" }}
                  />
                </Center>
                <Text size="sm" style={{ textAlign: "center" }}>
                  THE INDUSTRIAL WORLD&apos;S AUTONOMOUS SAFETY EXPERT
                </Text>
                <Box style={{ display: "flex", gap: "4px" }}>
                  <Box>
                    <IconCircleCheck
                      size={16}
                      style={{ marginTop: "2px" }}
                      color="var(--mantine-color-grape-filled)"
                    />
                  </Box>
                  <Text size="sm">
                    Audit, fix and rewrite procedures in seconds.
                  </Text>
                </Box>
                <Box style={{ display: "flex", gap: "4px" }}>
                  <Box>
                    <IconCircleCheck
                      size={16}
                      style={{ marginTop: "2px" }}
                      color="var(--mantine-color-grape-filled)"
                    />
                  </Box>
                  <Text size="sm">
                    Identify hazards and gaps, review accident history, and
                    simplify regulations.
                  </Text>
                </Box>
                <Box style={{ display: "flex", gap: "4px" }}>
                  <Box>
                    <IconCircleCheck
                      size={16}
                      style={{ marginTop: "2px" }}
                      color="var(--mantine-color-grape-filled)"
                    />
                  </Box>
                  <Text size="sm">
                    Automate audits and keep documents updated.
                  </Text>
                </Box>
              </Box>
            </Center>

            <Box>
              <Center mb="md" hiddenFrom="sm">
                <Image
                  src={logo}
                  alt="logo"
                  width={100}
                  style={{ filter: "invert(1)" }}
                />
              </Center>
              <Paper radius="md" p="xl" style={{ maxWidth: "320px" }}>
                <Text
                  size="lg"
                  mb="md"
                  fw={500}
                  style={{ textAlign: "center" }}
                >
                  {type === "signup"
                    ? "Join us by creating an account"
                    : "Welcome back! Pick a demo account to get started."}
                </Text>

                {type === "login" && demoAccounts.length > 0 ? (
                  <>
                    <Select
                      placeholder="Select user from organizations"
                      data={demoAccounts}
                      value={demoAccount ? demoAccount.value : null}
                      onChange={(_value, option) => setDemoAccount(option)}
                      clearable
                    />

                    <Divider
                      label="Or continue with email"
                      labelPosition="center"
                      my="lg"
                    />
                  </>
                ) : null}

                <form
                  onSubmit={form.onSubmit(async (values) => {
                    setLoading(true);

                    if (type === "login") {
                      await login({
                        email: values.email,
                        password: values.password,
                      });
                    } else {
                      await signup({
                        email: values.email,
                        password: values.password,
                        organizationName: values.organization,
                      });
                    }

                    setLoading(false);
                  })}
                >
                  <Stack>
                    <TextInput
                      required
                      label="Email"
                      placeholder="hello@mantine.dev"
                      value={form.values.email}
                      onChange={(event) =>
                        form.setFieldValue("email", event.currentTarget.value)
                      }
                      error={form.errors.email}
                      radius="md"
                    />

                    <PasswordInput
                      required
                      label="Password"
                      placeholder="Your password"
                      value={form.values.password}
                      onChange={(event) =>
                        form.setFieldValue(
                          "password",
                          event.currentTarget.value
                        )
                      }
                      error={form.errors.password}
                      radius="md"
                    />

                    {type === "signup" && (
                      <TextInput
                        required
                        description="Enter the name of your organization to join an existing one or create a new one."
                        label="Organization"
                        placeholder="Your organization"
                        value={form.values.organization}
                        onChange={(event) =>
                          form.setFieldValue(
                            "organization",
                            event.currentTarget.value
                          )
                        }
                        radius="md"
                        error={form.errors.organization}
                      />
                    )}
                  </Stack>

                  <Group justify="flex-end" mt="md">
                    <Anchor
                      component="button"
                      type="button"
                      onClick={() => {
                        router.push(type === "login" ? "/signup" : "/login");
                      }}
                      size="xs"
                      c="dark"
                    >
                      {type === "signup"
                        ? "Already have an account? Login"
                        : "Don't have an account? Register"}
                    </Anchor>
                    <Button
                      loading={loading}
                      loaderProps={{ type: "dots" }}
                      type="submit"
                      radius="xl"
                      color="var(--mantine-color-grape-filled)"
                    >
                      {upperFirst(type)}
                    </Button>
                  </Group>
                </form>
              </Paper>
            </Box>
          </Box>
        </Center>
      </Container>
    </Box>
  );
}
