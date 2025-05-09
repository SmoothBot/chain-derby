"use client";

import { SideBar } from "@/components/SideBar";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui";
import { EmbeddedWallet } from "@/components/EmbeddedWallet";
import { FundingPhase } from "@/components/FundingPhase";
import { HorseRace } from "@/components/HorseRace";
import { Scoreboard } from "@/components/Scoreboard";
import { RaceController } from "@/components/RaceController";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";

export default function Home() {
  const { state } = useSidebar();
  const { status } = useChainRaceContext();
  
  return (
    <div className="h-full">
      <SideBar />
      <div
        data-state={state}
        className={cn(
          "h-full data-[state=expanded]:ml-[300px] data-[state=collapsed]:ml-16 transition-all p-4 md:p-6",
          "data-[state=collapsed]:max-md:ml-0 data-[state=expanded]:max-md:ml-0"
        )}
      >
        <Card className="h-full overflow-auto p-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8">
              <div className="text-center py-4">
                <h1 className="text-4xl font-bold mb-2">EVM Chain Race</h1>
                <p className="text-muted-foreground">
                  Compare transaction speeds across different EVM-compatible blockchains
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Wallet Information */}
                <EmbeddedWallet />
                
                {/* Race Controller */}
                <RaceController />
              </div>
              
              {/* Funding Phase (only shown during funding) */}
              {(status === "idle" || status === "funding") && (
                <FundingPhase />
              )}
              
              {/* Horse Race Visualization */}
              {(status === "racing" || status === "finished") && (
                <HorseRace />
              )}
              
              {/* Scoreboard */}
              {(status === "racing" || status === "finished") && (
                <Scoreboard />
              )}
              
              {/* Instructions */}
              <Card className="w-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">How It Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-4 rounded-md bg-accent/15">
                      <h3 className="font-bold mb-2">Step 1: Wallet Setup</h3>
                      <p>An embedded wallet is automatically generated and stored in your browser. It will be used to interact with all chains.</p>
                    </div>
                    
                    <div className="p-4 rounded-md bg-accent/15">
                      <h3 className="font-bold mb-2">Step 2: Funding</h3>
                      <p>Fund your wallet with a small amount of each chain&apos;s native token using the faucet links provided.</p>
                    </div>
                    
                    <div className="p-4 rounded-md bg-accent/15">
                      <h3 className="font-bold mb-2">Step 3: Start Race</h3>
                      <p>Once funded, start the race! Each chain will process a zero-value transfer transaction.</p>
                    </div>
                    
                    <div className="p-4 rounded-md bg-accent/15">
                      <h3 className="font-bold mb-2">Step 4: Results</h3>
                      <p>Watch the race in real-time and see which chain confirms transactions fastest!</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}