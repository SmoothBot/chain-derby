"use client";

import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button
} from "@/components/ui";
import { Clock, Trophy, Medal, Zap, BarChart3, Camera, Share2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { captureElementAsImage } from "@/lib/utils";
import { SharePreviewModal } from "./SharePreviewModal";

export function LeaderboardPanel() {
  const { results, status, transactionCount } = useChainRaceContext();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const shareableContentRef = useRef<HTMLDivElement>(null);
  
  // Only display the leaderboard when the race is finished
  if (status !== "finished") {
    return null;
  }

  // Sort results by position for leaderboard
  const sortedResults = [...results]
    .filter(r => r.status === "success")
    .sort((a, b) => (a.position || Infinity) - (b.position || Infinity));

  // Calculate aggregate statistics
  const totalSuccessful = sortedResults.length;
  const fastestTime = sortedResults[0]?.averageLatency || 0;
  const fastestChain = sortedResults[0]?.name || "N/A";
  
  // Calculate average time across all chains
  const avgTime = sortedResults.length > 0
    ? Math.round(sortedResults.reduce((sum, r) => sum + (r.averageLatency || 0), 0) / sortedResults.length)
    : 0;
  
  // Calculate total race duration (from fastest to slowest)
  const lastResult = sortedResults.length > 0 ? sortedResults[sortedResults.length - 1] : null;
  const raceDuration = lastResult && lastResult.totalLatency
    ? (lastResult.totalLatency / 1000).toFixed(2)
    : "0";

  // If there are no successful results, don't show the panel
  if (sortedResults.length === 0) {
    return null;
  }
  
  // Handle opening the preview modal
  const handleOpenSharePreview = async () => {
    if (!shareableContentRef.current) return;
    
    try {
      setIsCapturing(true);
      
      // Capture only the shareable content (excluding Transaction Details)
      const imageDataUrl = await captureElementAsImage(shareableContentRef.current);
      
      // Store the captured image URL for the preview modal
      setCapturedImageUrl(imageDataUrl);
      
      // Open the preview modal
      setIsPreviewModalOpen(true);
      
    } catch (error) {
      console.error("Error capturing leaderboard image:", error);
      
      // Open modal anyway, but without an image
      setCapturedImageUrl(null);
      setIsPreviewModalOpen(true);
    } finally {
      setIsCapturing(false);
    }
  };
  
  // Handle closing the preview modal
  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  return (
    <Card className="w-full pt-7 pb-6 animate-in fade-in duration-500" ref={leaderboardRef}>
      {/* Shareable content - everything except Transaction Details */}
      <div ref={shareableContentRef} className="p-6 bg-card rounded-lg"
           style={{ 
             minHeight: '400px',
             background: 'var(--card)',
             border: '1px solid var(--border)'
           }}>
        <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="text-yellow-500 h-6 w-6" />
              Chain Derby
            </CardTitle>
            <CardDescription>
              {transactionCount > 1 
                ? `${transactionCount} transactions per chain`
                : "Single transaction per chain"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1.5 text-lg">
              <Clock className="mr-1 h-4 w-4" />
              {raceDuration}s
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2 flex items-center gap-1.5"
              onClick={handleOpenSharePreview}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <Camera className="h-4 w-4 animate-pulse" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              <span>{isCapturing ? "Capturing..." : "Share Results"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Race winner highlight */}
        {sortedResults.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800/40">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                  <Image 
                    src={sortedResults[0].logo || "/logos/rise.png"}
                    alt={`${sortedResults[0].name} Logo`}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1 shadow-md">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold">{sortedResults[0].name} Wins!</h3>
                <p className="text-muted-foreground">
                  Average transaction time: <span className="font-bold">{sortedResults[0].averageLatency}ms</span>
                </p>
                {sortedResults[0].txLatencies.length > 1 && (
                  <div className="mt-1 text-sm">
                    <span className="text-muted-foreground">Individual times: </span>
                    {sortedResults[0].txLatencies.map((time, i) => (
                      <span key={i} className="ml-1">
                        {time}ms{i < sortedResults[0].txLatencies.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold text-yellow-500">#1</p>
                <p className="text-muted-foreground text-sm">
                  {sortedResults[0].totalLatency && (
                    <span>Total: {(sortedResults[0].totalLatency / 1000).toFixed(2)}s</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Race statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fastest Time</p>
              <p className="text-xl font-bold">{fastestTime}ms</p>
              <p className="text-xs text-muted-foreground">{fastestChain}</p>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Time</p>
              <p className="text-xl font-bold">{avgTime}ms</p>
              <p className="text-xs text-muted-foreground">Across all chains</p>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <Medal className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Successful Chains</p>
              <p className="text-xl font-bold">{totalSuccessful}/{results.length}</p>
              <p className="text-xs text-muted-foreground">Completed transactions</p>
            </div>
          </div>
        </div>
        
        {/* Detailed leaderboard */}
        <div className="overflow-hidden rounded-md border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-muted-foreground text-sm font-medium">Chain</th>
                <th className="text-center py-3 px-4 text-muted-foreground text-sm font-medium">Transactions</th>
                <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Average Time</th>
                <th className="text-right py-3 px-4 text-muted-foreground text-sm font-medium">Total Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result, index) => (
                <tr 
                  key={result.chainId} 
                  className={`border-t ${index === 0 ? "bg-yellow-50 dark:bg-yellow-950/20" : 
                    index === 1 ? "bg-gray-50 dark:bg-gray-800/20" : 
                    index === 2 ? "bg-amber-50 dark:bg-amber-950/20" : ""}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mr-2" />}
                      {index === 1 && <Trophy className="h-5 w-5 text-gray-400 mr-2" />}
                      {index === 2 && <Trophy className="h-5 w-5 text-amber-700 mr-2" />}
                      {index > 2 && <span className="w-7 text-center">{index + 1}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image 
                          src={result.logo || "/logos/rise.png"}
                          alt={`${result.name} Logo`}
                          width={32}
                          height={32}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-xs text-muted-foreground">Chain ID: {result.chainId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                      {result.txCompleted}/{result.txTotal}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono">
                    <span className="font-medium">{result.averageLatency}ms</span>
                    {index === 0 && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
                        Fastest
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right font-mono">
                    {result.totalLatency && (
                      <span>{(result.totalLatency / 1000).toFixed(2)}s</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      </div>
      {/* End of shareable content */}
        
      {/* Individual transaction details - collapsible in the future */}
      <CardContent>
        {sortedResults.some(r => r.txLatencies.length > 1) && (
          <div className="mt-8">
            <h3 className="text-base font-medium mb-3">Transaction Details</h3>
            <div className="space-y-4">
              {sortedResults.map(result => (
                <div key={`details-${result.chainId}`} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full overflow-hidden">
                        <Image 
                          src={result.logo || "/logos/rise.png"}
                          alt={`${result.name} Logo`}
                          width={24}
                          height={24}
                        />
                      </div>
                      <h4 className="font-medium">{result.name}</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Avg: {result.averageLatency}ms
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {result.txLatencies.map((latency, index) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                        <p className="text-xs text-muted-foreground">Tx #{index + 1}</p>
                        <p className="font-mono text-sm">{latency}ms</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Share Preview Modal */}
      <SharePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
        imageDataUrl={capturedImageUrl}
        winnerName={fastestChain}
        winnerTime={fastestTime}
        totalChains={results.length}
      />
    </Card>
  );
}