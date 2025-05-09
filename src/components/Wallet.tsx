/* eslint-disable @typescript-eslint/no-unused-vars */
import { useModal } from "@/hooks/useModal";
import { Connector, useAccount, useConnect, useSwitchChain } from "wagmi";
import { Button, Card } from "./ui";
import { sepoliaTestnet } from "@/chain/sepolia";
import { toast } from "react-toastify";
import { ToastMessage } from "./ToastMessage";

import Image from "next/image";

export function Wallet() {
  const { onClose: hideModal } = useModal();

  const { connectors } = useConnect();
  const { connectAsync } = useConnect();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  function getIcon(icon?: string) {
    return icon?.replace(/\n/g, "") ?? "";
  }

  async function handleAddNetwork(connector: Connector) {
    if (!isConnected) {
      await connectAsync({ connector });
    }

    switchChain({ chainId: sepoliaTestnet.id }); // will automatically add new chain
    hideModal();

    // TODO: Wrap in success condition
    toast(
      <ToastMessage
        title="Successful!"
        content={`Testnet has been added to your ${connector.name}`}
      />,
      { type: "success" }
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {connectors
        .filter((connector) => {
          return connector.name !== "Injected";
        })
        .map((connector) => {
          return (
            <Button
              key={connector.name}
              variant="ghost"
              className="flex-1 flex gap-4 items-center justify-start p-3 md:p-6 h-auto text-base md:text-lg text-foreground font-medium"
              onClick={() => {
                handleAddNetwork(connector);
              }}
              asChild
            >
              <Card>
                <Image
                  unoptimized
                  src={getIcon(connector.icon)}
                  height={36}
                  width={36}
                  alt="Wallet Icon"
                />
                <p className="text-sm">{connector.name}</p>
              </Card>
            </Button>
          );
        })}
    </div>
  );
}
