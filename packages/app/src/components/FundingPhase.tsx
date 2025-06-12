"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { useIsMobile } from "@/hooks/useMobile";
import { RefreshCw, CheckCircle, XCircle, Loader2, Droplets, Circle } from "lucide-react";
import { formatEther } from "viem";
import Image from "next/image";

export function FundingPhase() {
  const { account, balances, checkBalances, isLoadingBalances, selectedChains, setSelectedChains, layerFilter, setLayerFilter, networkFilter, setNetworkFilter, getFilteredChains } = useChainRaceContext();
  const isMobile = useIsMobile();
  
  // Format balance for display - handle EVM, Solana, SOON, and Fuel
  const formatBalance = (balance: bigint, chainId: number | string) => {
    if (typeof chainId === 'string' && chainId.includes('solana')) {
      // Solana balance formatting (lamports to SOL)
      const solValue = Number(balance) / LAMPORTS_PER_SOL;
      if (isMobile) {
        if (solValue === 0) return '0.0';
        if (solValue < 0.0001) {
          return solValue.toExponential(2);
        }
        return solValue.toFixed(4).replace(/\.?0+$/, '');
      }
      // Desktop formatting
      if (solValue === 0) return '0.0';
      if (solValue < 0.000001) {
        return solValue.toExponential(3);
      }
      return solValue.toFixed(6).replace(/\.?0+$/, '');
    } else if (typeof chainId === 'string' && chainId.includes('soon')) {
      // SOON balance formatting (lamports to ETH, since SOON uses ETH as native currency)
      const ethValue = Number(balance) / LAMPORTS_PER_SOL; // SOON uses same decimals as Solana
      if (isMobile) {
        if (ethValue === 0) return '0.0';
        if (ethValue < 0.0001) {
          return ethValue.toFixed(8).replace(/\.?0+$/, '');
        }
        return ethValue.toFixed(4).replace(/\.?0+$/, '');
      }
      // Desktop formatting
      if (ethValue === 0) return '0.0';
      if (ethValue < 0.000001) {
        return ethValue.toFixed(8).replace(/\.?0+$/, '');
      }
      return ethValue.toFixed(6).replace(/\.?0+$/, '');
    } else if (chainId === '0' || chainId === '9889') {
      // Fuel balance formatting (9 decimals)
      const ethValue = Number(balance) / 1e9; // Convert from 9 decimals
      if (isMobile) {
        if (ethValue === 0) return '0.0';
        if (ethValue < 0.0001) {
          return ethValue.toExponential(2);
        }
        return ethValue.toFixed(4).replace(/\.?0+$/, '');
      }
      // Desktop formatting
      if (ethValue === 0) return '0.0';
      if (ethValue < 0.000001) {
        return ethValue.toExponential(3);
      }
      return ethValue.toFixed(6).replace(/\.?0+$/, '');
    } else if (typeof chainId === 'string' && chainId.includes('aptos')) {
      // Aptos balance formatting (8 decimals)
      const aptValue = Number(balance) / 1e8; // Convert from octas to APT
      if (isMobile) {
        if (aptValue === 0) return '0.0';
        if (aptValue < 0.0001) {
          return aptValue.toExponential(2);
        }
        return aptValue.toFixed(4).replace(/\.?0+$/, '');
      }
      // Desktop formatting
      if (aptValue === 0) return '0.0';
      if (aptValue < 0.000001) {
        return aptValue.toExponential(3);
      }
      return aptValue.toFixed(6).replace(/\.?0+$/, '');
    } else {
      // EVM balance formatting (wei to ETH)
      const etherValue = formatEther(balance);
      if (isMobile) {
        const num = parseFloat(etherValue);
        if (num === 0) return '0.0';
        if (num < 0.0001) {
          return num.toExponential(2);
        }
        return num.toFixed(4).replace(/\.?0+$/, '');
      }
      // Desktop formatting
      const num = parseFloat(etherValue);
      if (num === 0) return '0.0';
      if (num < 0.000001) {
        return num.toExponential(3);
      }
      return num.toFixed(6).replace(/\.?0+$/, '');
    }
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
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-between">
          <div className="flex justify-start">
            <ToggleGroup type="single" value={networkFilter} onValueChange={(value: string) => value && setNetworkFilter(value as 'Mainnet' | 'Testnet')}>
              <ToggleGroupItem value="Testnet" aria-label="Testnet chains">
                Testnet
              </ToggleGroupItem>
              <ToggleGroupItem value="Mainnet" aria-label="Mainnet chains">
                Mainnet
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="flex justify-end">
            <ToggleGroup type="single" value={layerFilter} onValueChange={(value: string) => value && setLayerFilter(value as 'L1' | 'L2' | 'Both')}>
              <ToggleGroupItem value="L1" aria-label="Layer 1 chains">
                L1
              </ToggleGroupItem>
              <ToggleGroupItem value="L2" aria-label="Layer 2 chains">
                L2
              </ToggleGroupItem>
              <ToggleGroupItem value="Both" aria-label="All chains">
                Both
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        <div className="space-y-2">
          {getFilteredChains().map((chain) => {
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-black dark:text-white">{chain.name}</h3>
                      {'layer' in chain ? (
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {chain.layer}
                        </Badge>
                      ) : (
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >
                          L1
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {chainBalance ? `${formatBalance(balance, chain.id)} ${
                        'nativeCurrency' in chain ? chain.nativeCurrency.symbol : 
                        (typeof chain.id === 'string' && chain.id.includes('solana')) ? 'SOL' : 'ETH'
                      }` : "Checking..."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Faucet link for testnet chains */}
                  {('testnet' in chain ? chain.testnet : true) && chain.faucetUrl && (
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
                        title={`Get ${'nativeCurrency' in chain ? chain.nativeCurrency.symbol : 
                          (typeof chain.id === 'string' && chain.id.includes('solana')) ? 'SOL' : 'ETH'} from faucet`}
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