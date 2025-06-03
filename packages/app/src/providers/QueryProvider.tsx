"use client";

import {
  QueryClientProvider as QueryProvider,
  QueryClient,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";

type ProviderProps = {
  children: ReactNode;
};

export function QueryClientProvider({ children }: Readonly<ProviderProps>) {
  const [queryClient] = useState(() => new QueryClient());

  return <QueryProvider client={queryClient}>{children}</QueryProvider>;
}
