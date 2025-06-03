"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ProviderProps = React.ComponentProps<typeof NextThemesProvider> & {
  children: React.ReactNode;
};

export function ThemeProvider(props: Readonly<ProviderProps>) {
  const { children } = props;

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
