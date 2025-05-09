"use client";

import { useChainRace } from "@/hooks/useChainRace";
import { ReactNode, createContext, useContext } from "react";

// Create a context with the return type of useChainRace
type ChainRaceContextType = ReturnType<typeof useChainRace>;

const ChainRaceContext = createContext<ChainRaceContextType | null>(null);

export function ChainRaceProvider({ children }: { children: ReactNode }) {
  const chainRaceState = useChainRace();
  
  return (
    <ChainRaceContext.Provider value={chainRaceState}>
      {children}
    </ChainRaceContext.Provider>
  );
}

export function useChainRaceContext() {
  const context = useContext(ChainRaceContext);
  
  if (!context) {
    throw new Error("useChainRaceContext must be used within a ChainRaceProvider");
  }
  
  return context;
}