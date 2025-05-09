"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui";
import { raceChains } from "@/chain/networks";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatEther } from "viem";

export function FundingPhase() {
  const { account, balances, checkBalances, isLoadingBalances, selectedChains, setSelectedChains } = useChainRaceContext();
  
  if (!account) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-24">
            <p>Loading wallet...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chain Balances</CardTitle>
        <Button 
          variant="outline" 
          onClick={checkBalances} 
          disabled={isLoadingBalances}
          className="flex items-center gap-2"
        >
          {isLoadingBalances ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Refresh Balances
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>To start the race, you need to fund your wallet on each chain with a small amount of tokens.</p>
          <p className="mt-2">Send native tokens to your wallet address:</p>
          <div className="p-2 bg-accent/25 rounded-md text-sm font-mono mt-2 overflow-hidden text-ellipsis">
            {account.address}
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          {raceChains.map((chain) => {
            const chainBalance = balances.find(b => b.chainId === chain.id);
            const hasBalance = chainBalance?.hasBalance || false;
            const balance = chainBalance?.balance || BigInt(0);
            const isSelected = selectedChains.includes(chain.id);
            
            return (
              <div 
                key={chain.id} 
                className="flex items-center justify-between py-2 px-4 rounded-md cursor-pointer relative"
                style={{ 
                  backgroundColor: isSelected ? `${chain.color}30` : `${chain.color}15`,
                  outline: isSelected ? "2px solid #b197fc" : "none", // Light purple outline
                  boxShadow: isSelected ? "0 0 8px rgba(177, 151, 252, 0.5)" : "none" // Purple glow
                }}
                onClick={() => {
                  // Toggle chain selection
                  if (isSelected) {
                    // Don't allow deselecting if it's the last chain
                    if (selectedChains.length > 1) {
                      setSelectedChains(prev => prev.filter(id => id !== chain.id));
                    }
                  } else {
                    setSelectedChains(prev => [...prev, chain.id]);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-2xl">{chain.emoji}</span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#b197fc] rounded-full border border-background animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-black dark:text-white">{chain.name}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {chainBalance ? `${formatEther(balance)} ${chain.nativeCurrency.symbol}` : "Checking..."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!chainBalance ? (
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  ) : hasBalance ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <>
                      <XCircle size={20} className="text-red-500" />
                      {chainBalance.error && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-red-500 p-0 h-auto hover:bg-transparent"
                          title={chainBalance.error}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when clicking retry
                            console.log(`Retrying balance check for chain ${chain.id}`);
                            checkBalances();
                          }}
                        >
                          <RefreshCw size={12} className="mr-1" />
                          Retry
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}