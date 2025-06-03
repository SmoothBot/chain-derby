"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui";
import { Info } from "lucide-react";

export function DisclaimersButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Info className="h-4 w-4" />
        Disclaimers
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Chain Derby Disclaimers
            </DialogTitle>
            <DialogDescription>
              Important information about blockchain transaction speed testing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Purpose Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Purpose</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chain Derby is designed to <strong>demonstrate relative transaction latency from your browser</strong> across different blockchain networks. 
                This tool provides a real-time comparison of how quickly transactions are confirmed on various EVM-compatible chains when initiated from your specific location and network conditions.
              </p>
            </div>

            {/* Test Details Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Test Details</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>
                  The test works by sending simple transactions simultaneously to multiple blockchain networks and measuring the time from transaction submission to confirmation. Key aspects include:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Transactions are sent in parallel to all selected networks</li>
                  <li>Gas Price & nonce is pre-fetched and transactions are pre-signed</li>
                  <li>Timing measurements capture end-to-end latency from your browser</li>
                  <li>Results include individual transaction times and averages across multiple transactions</li>
                  <li>Network conditions, RPC endpoint performance, and geographic location all affect results</li>
                  <li>Results may vary significantly between different test runs and locations</li>
                </ul>
              </div>
            </div>

            {/* Important Disclaimer Section */}
            <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                ⚠️ Important Security Disclosure
              </h3>
              <div className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed space-y-2">
                <p>
                  <strong>This test compares Layer 1 confirmations with Layer 2 confirmations, and each blockchain has its own unique security model.</strong>
                </p>
                <p>
                  Layer 1 networks (like Monad &amp; Sonic) and Layer 2 solutions (like Base &amp; RISE) operate with different:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Security assumptions</strong> - L2s inherit security from L1 but add additional trust assumptions</li>
                  <li><strong>Finality guarantees</strong> - Confirmation times don&apos;t reflect the same level of finality</li>
                  <li><strong>Decentralization levels</strong> - Networks vary in validator count, geographic distribution, and L2&apos;s typically employ a centralised sequencer</li>
                  <li><strong>Economic security</strong> - Different amounts of value securing each network</li>
                </ul>
                <p className="font-semibold">
                  Do Your Own Research (DYOR). Faster confirmation times do not necessarily indicate better security, decentralization, or suitability for your use case.
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Additional Notes</h3>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
                <p>• This tool is for educational and demonstration purposes only</p>
                <p>• Results are not investment advice or recommendations</p>
                <p>• Transaction fees and gas costs apply when using real funds</p>
                <p>• Always verify critical transactions on official block explorers</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}