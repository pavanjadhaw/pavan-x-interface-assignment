import "@mantine/core/styles.css";
import React from "react";
import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "../theme";
import { Providers } from "./providers";
import getQueryClient from "@/utils/get-query-client";
import { fetchServerUser } from "@/hooks/use-server-user";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { userProfileQueryKey } from "@/queries/get-profile";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

export const metadata = {
  title: "Interface",
  description: "The industrial world's autonomous safety expert",
};

export default async function RootLayout({ children }: { children: any }) {
  const queryClient = getQueryClient();
  const userProfile = await fetchServerUser();

  queryClient.setQueryData(userProfileQueryKey, userProfile);

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications containerWidth={320} />
          <Providers>
            <HydrationBoundary state={dehydrate(queryClient)}>
              {children}
            </HydrationBoundary>
          </Providers>
        </MantineProvider>
      </body>
    </html>
  );
}
