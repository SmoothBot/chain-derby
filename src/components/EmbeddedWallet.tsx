"use client";

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { CopyIcon, RefreshCw } from "lucide-react";
import { useState } from "react";

export function EmbeddedWallet() {
  const { account, privateKey, resetWallet } = useChainRaceContext();
  const [copied, setCopied] = useState<"address" | "key" | null>(null);
  
  const copyToClipboard = (text: string, type: "address" | "key") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };
  
  if (!account || !privateKey) {
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
        <CardTitle>Your Embedded Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
              {account.address}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => copyToClipboard(account.address, "address")}
            >
              {copied === "address" ? "Copied!" : <CopyIcon size={18} />}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Private Key (Do not share!)</label>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
              {privateKey.substring(0, 10)}...{privateKey.substring(privateKey.length - 10)}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => copyToClipboard(privateKey, "key")}
            >
              {copied === "key" ? "Copied!" : <CopyIcon size={18} />}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-end">
          <Button 
            variant="outline" 
            onClick={resetWallet}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Reset Wallet
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}