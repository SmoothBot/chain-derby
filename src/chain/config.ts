import { injected } from "@wagmi/connectors";
import { Config, createConfig, http } from "@wagmi/core";
import { raceChains } from "./networks";

/** Prepare Wagmi Config */
export const config: Config = createConfig({
  chains: raceChains,
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