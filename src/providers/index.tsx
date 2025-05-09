"use client";

import { config } from "@/chain/config";
import { WagmiProvider } from "wagmi";
import { ModalProvider } from "./ModalProvider";
import { PageProvider } from "./PageProvider";
import { QueryClientProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ChainRaceProvider } from "./ChainRaceProvider";

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: Readonly<AppProviderProps>) {
  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider>
        <ThemeProvider attribute="class" enableSystem defaultTheme="dark">
          <ChainRaceProvider>
            <PageProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </PageProvider>
          </ChainRaceProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}