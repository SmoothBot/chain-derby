"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from "@/components/ui";
import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { useSolanaEmbeddedWallet } from "@/hooks/useSolanaEmbeddedWallet";
import { useFuelEmbeddedWallet } from "@/hooks/useFuelEmbeddedWallet";
import { useAptosEmbeddedWallet } from "@/hooks/useAptosEmbeddedWallet";
import { useSoonEmbeddedWallet } from "@/hooks/useSoonEmbeddedWallet";
import { CopyIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function EmbeddedWallet() {
  const { account, privateKey } = useChainRaceContext();
  const { publicKey: solanaPublicKey, secret: solanaSecret, isReady: solanaReady } = useSolanaEmbeddedWallet();
  const { address: fuelAddress, secret: fuelSecret, isReady: fuelReady } = useFuelEmbeddedWallet();
  const { address: aptosAddress, privateKey: aptosPrivateKey, isReady: aptosReady } = useAptosEmbeddedWallet();
  const { publicKey: soonPublicKey, secret: soonSecret, isReady: soonReady } = useSoonEmbeddedWallet();
  const [copied, setCopied] = useState<"address" | "key" | "sol-address" | "sol-key" | "fuel-address" | "fuel-key" | "aptos-address" | "aptos-key" | "soon-address" | "soon-key" | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [showSolanaKey, setShowSolanaKey] = useState(false);
  const [showFuelKey, setShowFuelKey] = useState(false);
  const [showAptosKey, setShowAptosKey] = useState(false);
  const [showSoonKey, setShowSoonKey] = useState(false);
  
  const copyToClipboard = (text: string, type: "address" | "key" | "sol-address" | "sol-key" | "fuel-address" | "fuel-key" | "aptos-address" | "aptos-key" | "soon-address" | "soon-key") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };
  
  if (!account || !privateKey || !solanaReady || !fuelReady || !aptosReady || !soonReady) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-24">
            <p>Loading wallets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full pt-8">
      <CardHeader className="space-y-5">
        <CardTitle>Your Embedded Wallets</CardTitle>
        <CardDescription>Send native tokens to your wallet addresses.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ethereum Wallet Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ethereum Wallet</h3>
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
                {showKey ? `${privateKey.substring(0, 18)}...${privateKey.substring(privateKey.length - 18)}` : "••••••••••••••••••••"}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => copyToClipboard(privateKey, "key")}
              >
                {copied === "key" ? "Copied!" : <CopyIcon size={18} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator />

        {/* Solana Wallet Section */}
        {solanaPublicKey && solanaSecret && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Solana Wallet</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
                  {solanaPublicKey.toBase58()}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(solanaPublicKey.toBase58(), "sol-address")}
                >
                  {copied === "sol-address" ? "Copied!" : <CopyIcon size={18} />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Private Key (Do not share!)</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
                  {showSolanaKey ? `${solanaSecret.substring(0, 18)}...${solanaSecret.substring(solanaSecret.length - 18)}` : "••••••••••••••••••••"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSolanaKey(!showSolanaKey)}
                >
                  {showSolanaKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(solanaSecret, "sol-key")}
                >
                  {copied === "sol-key" ? "Copied!" : <CopyIcon size={18} />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Separator */}
        <Separator />

        {/* Fuel Wallet Section */}
        {fuelAddress && fuelSecret && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fuel Wallet</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
                  {fuelAddress}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(fuelAddress, "fuel-address")}
                >
                  {copied === "fuel-address" ? "Copied!" : <CopyIcon size={18} />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Private Key (Do not share!)</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
                  {showFuelKey ? `${fuelSecret.substring(0, 18)}...${fuelSecret.substring(fuelSecret.length - 18)}` : "••••••••••••••••••••"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFuelKey(!showFuelKey)}
                >
                  {showFuelKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(fuelSecret, "fuel-key")}
                >
                  {copied === "fuel-key" ? "Copied!" : <CopyIcon size={18} />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Separator */}
        <Separator />

        {/* Aptos Wallet Section */}
        {aptosAddress && aptosPrivateKey && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Aptos Wallet</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
                  {aptosAddress}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(aptosAddress, "aptos-address")}
                >
                  {copied === "aptos-address" ? "Copied!" : <CopyIcon size={18} />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Private Key (Do not share!)</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
                  {showAptosKey ? `${aptosPrivateKey.substring(0, 18)}...${aptosPrivateKey.substring(aptosPrivateKey.length - 18)}` : "••••••••••••••••••••"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAptosKey(!showAptosKey)}
                >
                  {showAptosKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(aptosPrivateKey, "aptos-key")}
                >
                  {copied === "aptos-key" ? "Copied!" : <CopyIcon size={18} />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Separator */}
        <Separator />

        {/* SOON Wallet Section */}
        {soonPublicKey && soonSecret && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SOON Wallet</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
                  {soonPublicKey.toBase58()}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(soonPublicKey.toBase58(), "soon-address")}
                >
                  {copied === "soon-address" ? "Copied!" : <CopyIcon size={18} />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Private Key (Do not share!)</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/25 rounded-md text-sm font-mono flex-1 overflow-hidden text-ellipsis">
                  {showSoonKey ? `${soonSecret.substring(0, 18)}...${soonSecret.substring(soonSecret.length - 18)}` : "••••••••••••••••••••"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSoonKey(!showSoonKey)}
                >
                  {showSoonKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(soonSecret, "soon-key")}
                >
                  {copied === "soon-key" ? "Copied!" : <CopyIcon size={18} />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}