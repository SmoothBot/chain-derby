"use client";

import { 
  Button, 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { Flag, RefreshCw, Play, ChevronDown, Settings } from "lucide-react";
import { TransactionCount } from "@/hooks/useChainRace";
import { raceChains } from "@/chain/networks";

export function RaceController() {
  const { 
    status, 
    startRace, 
    resetRace,
    restartRace,
    isReady, 
    checkBalances, 
    transactionCount, 
    setTransactionCount,
    selectedChains,
    setSelectedChains
  } = useChainRaceContext();
  
  const handleAction = () => {
    if (status === "idle") {
      checkBalances();
    } else if (status === "ready") {
      startRace();
    } else if (status === "finished") {
      // Instead of resetting, just restart with same configuration
      restartRace();
      // Now we can immediately start a new race with the same config
      startRace();
    }
  };
  
  const handleTxCountChange = (count: TransactionCount) => {
    setTransactionCount(count);
  };
  
  const toggleChain = (chainId: number) => {
    if (status === "racing") return; // Don't allow changes during a race
    
    setSelectedChains(prev => {
      // If chain is already selected, remove it (unless it would remove all chains)
      if (prev.includes(chainId)) {
        const newSelection = prev.filter(id => id !== chainId);
        // Prevent deselecting all chains
        return newSelection.length > 0 ? newSelection : prev;
      }
      // Otherwise add it
      return [...prev, chainId];
    });
  };
  
  if (!isReady) {
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
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>Race Control</CardTitle>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Chain Selection Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={status === "racing"}
                  className="flex items-center gap-1"
                >
                  <Settings size={16} />
                  <span>Chains</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Chains</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {raceChains.map(chain => (
                  <DropdownMenuCheckboxItem
                    key={chain.id}
                    checked={selectedChains.includes(chain.id)}
                    onCheckedChange={() => toggleChain(chain.id)}
                    disabled={status === "racing"}
                  >
                    <span 
                      className="mr-2"
                      style={{ 
                        color: chain.color,
                      }}
                    >
                      {chain.emoji}
                    </span>
                    {chain.name}
                    {!chain.testnet && 
                      <span className="ml-2 text-xs opacity-60">(mainnet)</span>
                    }
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Transaction Count Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Transactions:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={status === "racing"}
                    className="flex items-center gap-1 min-w-24"
                  >
                    <span>{transactionCount}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleTxCountChange(1)}>
                    1 transaction
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTxCountChange(5)}>
                    5 transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTxCountChange(10)}>
                    10 transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTxCountChange(20)}>
                    20 transactions
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          {status === "idle" && (
            <p className="text-xl">Welcome to the EVM Chain Race!</p>
          )}
          
          {status === "funding" && (
            <p className="text-xl">Fund your wallet to start the race</p>
          )}
          
          {status === "ready" && (
            <p className="text-xl">Ready to race! Press Start to begin.</p>
          )}
          
          {status === "racing" && (
            <p className="text-xl">Race in progress...</p>
          )}
          
          {status === "finished" && (
            <p className="text-xl">Race completed!</p>
          )}
          
          <p className="text-sm text-muted-foreground mt-2">
            {status === "idle" && "Check your balances to see if you're ready to race"}
            {status === "funding" && "Send funds to your wallet on each chain to participate"}
            {status === "ready" && `All chains funded and ready to go! (${transactionCount} tx per chain)`}
            {status === "racing" && `Waiting for all chains to complete ${transactionCount} transactions...`}
            {status === "finished" && "Race completed! Start another race with the same configuration."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button
          size="lg"
          className="w-full sm:w-auto px-8"
          disabled={status === "racing" || (!isReady && status !== "funding")}
          onClick={handleAction}
        >
          {status === "idle" && (
            <>
              <RefreshCw size={16} className="mr-2" />
              Check Balances
            </>
          )}
          
          {status === "funding" && (
            <>
              <RefreshCw size={16} className="mr-2" />
              Check Again
            </>
          )}
          
          {status === "ready" && (
            <>
              <Play size={16} className="mr-2" />
              Start Race
            </>
          )}
          
          {status === "racing" && (
            <>Racing...</>
          )}
          
          {status === "finished" && (
            <>
              <Play size={16} className="mr-2" />
              Start Race
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}