"use client";

import { Card, Button } from "@/components/ui";
import { EmbeddedWallet } from "@/components/EmbeddedWallet";
import { FundingPhase } from "@/components/FundingPhase";
import { ChainRace } from "@/components/ChainRace";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { DisclaimersButton } from "@/components/DisclaimersModal";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { useState, useEffect } from "react";
import { ChainRaceStatus } from "@/hooks/useChainRace";
import dynamic from "next/dynamic";

// Dynamic import for LeaderboardPanel (only loaded when racing/finished)
const LeaderboardPanel = dynamic(() => import("@/components/LeaderboardPanel").then(mod => ({ default: mod.LeaderboardPanel })), {
  loading: () => (
    <Card className="w-full">
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </Card>
  ),
  ssr: false // Since this only shows during racing, no need for SSR
});

export default function Home() {
  const { status, checkBalances, isLoadingBalances } = useChainRaceContext();
  // Create a stabilized status to prevent flickering
  const [stableStatus, setStableStatus] = useState<ChainRaceStatus>(status);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initializeApp = async () => {
      if (isInitialized || isLoadingBalances) {
        return;
      }

      // Add a small delay to ensure all components are mounted
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Only check balances if we're in an initial state
      if (status === "idle" || status === "funding") {
        console.log('Starting initial balance check from page...');
        await checkBalances();
      }

      setIsInitialized(true);
    };

    initializeApp();
  }, [status, isInitialized, isLoadingBalances, checkBalances]);

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
        <Card className="h-full overflow-x-hidden p-4 md:p-7 w-full max-w-6xl shadow-xl border border-accent/50 rounded-xl">
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
              <div className="flex items-center gap-3">
                <DisclaimersButton />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex items-center gap-2"
                >
                  <a 
                    href="https://github.com/SmoothBot/chain-derby" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Contribute
                  </a>
                </Button>
              </div>
              <DarkModeToggle />
            </div>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}