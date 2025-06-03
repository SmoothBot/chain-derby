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
import { RefreshCw, Play, ChevronDown, Settings } from "lucide-react";
import { TransactionCount } from "@/hooks/useChainRace";
import { raceChains } from "@/chain/networks";

export function RaceController() {
  const { 
    status, 
    startRace, 
    restartRace,
    isReady, 
    checkBalances, 
    transactionCount, 
    setTransactionCount,
    selectedChains,
    setSelectedChains,
    isLoadingBalances
  } = useChainRaceContext();
  
  const handleAction = () => {
    console.log("Handle action clicked. Current status:", status);
    
    if (status === "idle") {
      console.log("Checking balances...");
      checkBalances();
    } else if (status === "ready") {
      console.log("Starting race...");
      startRace();
    } else if (status === "funding") {
      console.log("Checking balances again...");
      checkBalances();
    } else if (status === "finished") {
      console.log("Resetting race...");
      // Reset to the ready state so the FundingPhase will be shown again
      restartRace(); 
      // The UI will now show FundingPhase again until the user starts a new race
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
  
  // Display the current status in dev mode for debugging
  console.log("RaceController rendering with status:", status);
  
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
            <p className="text-xl">
              {isLoadingBalances 
                ? <span className="flex items-center justify-center"><RefreshCw size={18} className="animate-spin mr-2" /> Checking Balances...</span> 
                : "Welcome to Chain Derby!"}
            </p>
          )}
          
          {status === "funding" && (
            <p className="text-xl">
              {isLoadingBalances
                ? <span className="flex items-center justify-center"><RefreshCw size={18} className="animate-spin mr-2" /> Checking Balances...</span>
                : "Fund your wallet to start the race"}
            </p>
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
            {status === "funding" && 
              selectedChains.length > 0 
                ? `Send funds to your wallet on the selected chains (${selectedChains.length} selected)` 
                : "Send funds to your wallet on at least one chain to participate"
            }
            {status === "ready" && `${selectedChains.length} chain${selectedChains.length !== 1 ? 's' : ''} ready for racing (${transactionCount} tx per chain)`}
            {status === "racing" && `Waiting for all chains to complete ${transactionCount} transactions...`}
            {status === "finished" && "Race completed! Start another race with the same configuration."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button
          size="lg"
          className="w-full sm:w-auto px-8"
          disabled={status === "racing" || (!isReady && status !== "funding") || isLoadingBalances}
          onClick={handleAction}
        >
          {status === "idle" && (
            <>
              <RefreshCw size={16} className={`mr-2 ${isLoadingBalances ? "animate-spin" : ""}`} />
              {isLoadingBalances ? "Checking Balances..." : "Check Balances"}
            </>
          )}
          
          {status === "funding" && (
            <>
              <RefreshCw size={16} className={`mr-2 ${isLoadingBalances ? "animate-spin" : ""}`} />
              {isLoadingBalances ? "Checking Balances..." : "Check Again"}
            </>
          )}
          
          {status === "ready" && (
            <>
              <Play size={16} className="mr-2 white" />
              Start Race
            </>
          )}
          
          {status === "racing" && (
            <>Racing...</>
          )}
          
          {status === "finished" && (
            <>
              <RefreshCw size={16} className="mr-2" />
              Reset Race
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}