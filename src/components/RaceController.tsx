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
  DropdownMenuTrigger
} from "@/components/ui";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { Flag, RefreshCw, Play, ChevronDown } from "lucide-react";
import { TransactionCount } from "@/hooks/useChainRace";

export function RaceController() {
  const { 
    status, 
    startRace, 
    resetRace, 
    isReady, 
    checkBalances, 
    transactionCount, 
    setTransactionCount 
  } = useChainRaceContext();
  
  const handleAction = () => {
    if (status === "idle") {
      checkBalances();
    } else if (status === "ready") {
      startRace();
    } else if (status === "finished") {
      resetRace();
    }
  };
  
  const handleTxCountChange = (count: TransactionCount) => {
    setTransactionCount(count);
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
            {status === "finished" && "See the results and try again!"}
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
              <Flag size={16} className="mr-2" />
              New Race
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}