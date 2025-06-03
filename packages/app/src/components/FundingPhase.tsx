"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { raceChains } from "@/chain/networks";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { useIsMobile } from "@/hooks/useMobile";
import { RefreshCw, CheckCircle, XCircle, Loader2, Droplets, Circle } from "lucide-react";
import { formatEther } from "viem";
import Image from "next/image";

export function FundingPhase() {
  const { account, balances, checkBalances, isLoadingBalances, selectedChains, setSelectedChains } = useChainRaceContext();
  const isMobile = useIsMobile();
  
  // Format balance for display - truncate on mobile
  const formatBalance = (balance: bigint) => {
    const etherValue = formatEther(balance);
    if (isMobile) {
      // On mobile, show max 4 decimal places or scientific notation for very small values
      const num = parseFloat(etherValue);
      if (num === 0) return '0';
      if (num < 0.0001) {
        return num.toExponential(2);
      }
      return num.toFixed(4).replace(/\.?0+$/, '');
    }
    // On desktop, show more precision but still reasonable
    const num = parseFloat(etherValue);
    if (num < 0.000001) {
      return num.toExponential(3);
    }
    return num.toFixed(6).replace(/\.?0+$/, '');
  };
  
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
    <Card className="w-full pt-6 gap-3">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between pb-0 mb-0 gap-4 sm:gap-0">
        <CardTitle color="mb-0">Race Control</CardTitle>
        <Button 
          variant="outline" 
          onClick={checkBalances} 
          disabled={isLoadingBalances}
          className="flex items-center gap-2 text-xs sm:text-sm"
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
      <CardContent className="space-y-4 pb-4">
        <CardDescription>
          To start the race, fund your wallet on each chain with a small amount of tokens.
        </CardDescription>
        
        <div className="space-y-2">
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
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image 
                        src={chain.logo || "/logos/rise.png"}
                        alt={`${chain.name} Logo`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#b197fc] rounded-full border border-background animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-black dark:text-white">{chain.name}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {chainBalance ? `${formatBalance(balance)} ${chain.nativeCurrency.symbol}` : "Checking..."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Faucet link for testnet chains */}
                  {chain.testnet && chain.faucetUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs p-1 h-auto hover:bg-transparent opacity-70 hover:opacity-100"
                      asChild
                      onClick={(e) => e.stopPropagation()} // Prevent row click when clicking faucet
                    >
                      <a 
                        href={chain.faucetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                        title={`Get ${chain.nativeCurrency.symbol} from faucet`}
                      >
                        <Droplets size={12} />
                        <span>Faucet</span>
                      </a>
                    </Button>
                  )}
                  
                  {!chainBalance ? (
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  ) : hasBalance ? (
                    // Show checkmark for selected chains with balance, circle for unselected chains with balance
                    isSelected ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <Circle size={20} className="text-gray-400" />
                    )
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