"use client";

import { Card } from "@/components/ui";
import { EmbeddedWallet } from "@/components/EmbeddedWallet";
import { FundingPhase } from "@/components/FundingPhase";
import { ChainRace } from "@/components/ChainRace";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
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
        <Card className="h-full overflow-x-hidden p-7 w-full max-w-6xl shadow-xl border border-accent/50 rounded-xl">
        <ChainRace />
          <div className="w-full">
          <div className="grid gap-8">
            {/* Chain Derby Visualization (shown when racing or finished) */}
            {(stableStatus === "racing" || stableStatus === "finished") && (
              <LeaderboardPanel />
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Wallet Information */}
              <EmbeddedWallet />
              {/* Race Controller */}
              <FundingPhase />
            </div>
          
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div></div>
              <p><a href="https://github.com/SmoothBot/horse-race/tree/ui-upgrade#">GitHub</a></p>
              <DarkModeToggle />
            </div>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}