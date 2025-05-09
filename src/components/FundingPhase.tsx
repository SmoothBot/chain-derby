"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui";
import { raceChains } from "@/chain/networks";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatEther } from "viem";

export function FundingPhase() {
  const { account, balances, checkBalances, isLoadingBalances } = useChainRaceContext();
  
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
        <CardTitle>Fund Your Race Wallet</CardTitle>
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
              Check Balances
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>To start the race, you need to fund your wallet on each chain with a small amount of tokens.</p>
          <p className="mt-2">Send at least 0.01 native tokens to your wallet address:</p>
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
            
            return (
              <div 
                key={chain.id} 
                className="flex items-center justify-between py-2 px-4 rounded-md"
                style={{ backgroundColor: `${chain.color}15` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{chain.emoji}</span>
                  <div>
                    <h3 className="font-medium">{chain.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {chainBalance ? `${formatEther(balance)} ${chain.nativeCurrency.symbol}` : "Checking..."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {!chainBalance ? (
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  ) : hasBalance ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <XCircle size={20} className="text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-sm">
          <span className="font-medium">Need test tokens?</span>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Ethereum Sepolia: <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Sepolia Faucet</a></li>
            <li>Polygon Mumbai: <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Polygon Faucet</a></li>
            <li>Arbitrum Sepolia: <a href="https://sepolia-faucet.arbitrum.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Arbitrum Sepolia Faucet</a></li>
            <li>Optimism Sepolia: <a href="https://www.optimism.io/faucets" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Optimism Faucets</a></li>
            <li>Base Sepolia: <a href="https://www.coinbase.com/faucets/base-sepolia-faucet" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Base Sepolia Faucet</a></li>
            <li>RISE Testnet: <a href="https://faucet.testnet.riselabs.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">RISE Faucet</a></li>
            <li>Monad Testnet: <a href="https://faucet.monad.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Monad Faucet</a></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}