"use client";

import { Card } from "@/components/ui";
import { EmbeddedWallet } from "@/components/EmbeddedWallet";
import { FundingPhase } from "@/components/FundingPhase";
import { ChainRace } from "@/components/ChainRace";
import { RaceController } from "@/components/RaceController";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { useState, useEffect } from "react";
import { ChainRaceStatus } from "@/hooks/useChainRace";

export default function Home() {
  const { status } = useChainRaceContext();
  // Create a stabilized status to prevent flickering
  const [stableStatus, setStableStatus] = useState<ChainRaceStatus>(status);
  
  useEffect(() => {
    const isRacingOrFinished = (s: ChainRaceStatus) => s === "racing" || s === "finished";
    const isInitialState = (s: ChainRaceStatus) => s === "idle" || s === "funding" || s === "ready";
    
    // For transitions to racing or finished, update immediately
    if (isRacingOrFinished(status)) {
      setStableStatus(status);
    } 
    // For transitions from racing/finished to other states, add a delay
    else if (isRacingOrFinished(stableStatus) && !isRacingOrFinished(status)) {
      // Only allow transition away from racing/finished if it's a deliberate action (like reset)
      if (status === "ready") {
        const timer = setTimeout(() => {
          setStableStatus(status);
        }, 500); // 500ms delay before switching away from racing view
        return () => clearTimeout(timer);
      }
      // Otherwise ignore the status change - keep showing race UI
      // This prevents balance checks from affecting the UI
    } 
    // For initial states (idle, funding, ready)
    else if (isInitialState(status)) {
      setStableStatus(status);
    }
  }, [status, stableStatus]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30">
      <div className="h-full p-4 md:p-8 flex justify-center">
        <Card className="h-full overflow-auto p-7 w-full max-w-6xl shadow-xl border border-accent/50 rounded-xl">
          <div className="w-full">
          <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="text-center sm:text-left py-2">
                <h1 className="text-3xl sm:text-4xl mb-2">Chain Derby</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Compare transaction speeds across different EVM-compatible blockchains
                </p>
              </div>
              <div className="flex-shrink-0">
                <DarkModeToggle />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Wallet Information */}
              <EmbeddedWallet />
              
              {/* Race Controller */}
              <RaceController />
            </div>
            
            {/* Funding Phase (shown when not racing or finished) */}
            {(stableStatus === "idle" || stableStatus === "funding" || stableStatus === "ready") && (
              <FundingPhase />
            )}
            
            {/* Chain Derby Visualization (shown when racing or finished) */}
            {(stableStatus === "racing" || stableStatus === "finished") && (
              <ChainRace />
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
            <div className="text-center text-sm text-muted-foreground py-4">
              <p>© Speedy Lads Limitted</p>
            </div>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}