import { injected } from "@wagmi/connectors";
import { Config, createConfig, http } from "@wagmi/core";
import { Chain } from "viem";
import { raceChains } from "./networks";

// Create a proper Chain array that satisfies the readonly [Chain, ...Chain[]] requirement
const configChains: readonly [Chain, ...Chain[]] = (raceChains as unknown as readonly [Chain, ...Chain[]])

/** Prepare Wagmi Config */
export const config: Config = createConfig({
  chains: configChains,
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: Object.fromEntries(
    raceChains.map((chain) => [
      chain.id,
      http(chain.rpcUrls.default.http[0]),
    ])
  ),
  ssr: true,
});

// Register config with TypeScript for type safety
declare module '@wagmi/core' {
  interface Register {
    config: typeof config
  }
}