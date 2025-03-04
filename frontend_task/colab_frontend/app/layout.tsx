import "@mantine/core/styles.css";
import React from "react";
import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "../theme";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";

export const metadata = {
  title: "Interface",
  description: "The industrial world's autonomous safety expert",
};

export default function RootLayout({ children }: { children: any }) {
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
        <NextTopLoader color="var(--mantine-color-grape-4)" />
        <MantineProvider theme={theme}>
          <Providers>{children}</Providers>
        </MantineProvider>
      </body>
    </html>
  );
}
