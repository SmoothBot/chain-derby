"use client";

import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Clock, XCircle, Trophy, SkipForward } from "lucide-react";

export function Scoreboard() {
  const { results, status, transactionCount, skipChain } = useChainRaceContext();
  
  // Sort results by position for scoreboard
  const sortedResults = [...results]
    .filter(r => r.status === "success")
    .sort((a, b) => (a.position || Infinity) - (b.position || Infinity));
  
  // If none are successful yet, show "Race in progress"
  if (sortedResults.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Scoreboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">
              {status === "racing" ? "Race in progress..." : "Race hasn't started yet"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scoreboard {transactionCount > 1 ? `(${transactionCount} Transactions)` : ""}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Position</th>
                <th className="text-left py-2">Chain</th>
                <th className="text-right py-2">Latency (Avg / Total)</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result) => (
                <tr key={result.chainId} className="border-b border-border-primary/30">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {result.position === 1 && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                      
                      {result.position === 2 && (
                        <Trophy className="h-5 w-5 text-gray-400" />
                      )}
                      
                      {result.position === 3 && (
                        <Trophy className="h-5 w-5 text-amber-700" />
                      )}
                      
                      {(result.position || 0) > 3 && (
                        <span className="w-5 h-5 inline-flex items-center justify-center">
                          {result.position}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{result.emoji}</span>
                      <span>{result.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    {result.averageLatency ? (
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {result.averageLatency}ms / {result.totalLatency}ms
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {result.totalLatency && result.txCompleted > 1 
                            ? `${result.txCompleted} txs, ${(result.totalLatency/1000).toFixed(2)}s total` 
                            : `${result.txCompleted} tx`}
                        </span>
                        {result.txLatencies && result.txLatencies.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            {result.txLatencies.map((l, i) => 
                              <span key={i} className="ml-1">{l}ms{i < result.txLatencies.length-1 ? ',' : ''}</span>
                            )}
                          </span>
                        )}
                      </div>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Failed Transactions */}
          {results.some(r => r.status === "error") && (
            <div className="mt-6">
              <h3 className="font-medium mb-2 text-sm">Failed Transactions</h3>
              <div className="space-y-2">
                {results
                  .filter(r => r.status === "error")
                  .map((result) => (
                    <div 
                      key={result.chainId} 
                      className="p-2 rounded-md bg-red-100 dark:bg-red-950/20 text-sm flex items-center gap-2"
                    >
                      <XCircle size={16} className="text-red-500 shrink-0" />
                      <div>
                        <span className="font-medium">{result.name}: </span>
                        <span className="text-muted-foreground">{result.error}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* Pending Transactions */}
          {results.some(r => r.status === "pending" || r.status === "racing") && (
            <div className="mt-6">
              <h3 className="font-medium mb-2 text-sm">Pending Transactions</h3>
              <div className="space-y-2">
                {results
                  .filter(r => r.status === "pending" || r.status === "racing")
                  .map((result) => (
                    <div 
                      key={result.chainId} 
                      className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-950/20 text-sm flex items-center gap-2"
                    >
                      <Clock size={16} className="text-yellow-500 shrink-0" />
                      <div className="flex flex-1 justify-between items-center">
                        <div>
                          <span className="font-medium">{result.name}: </span>
                          <span className="text-muted-foreground">
                            {result.status === "racing" 
                              ? (transactionCount > 1 
                                  ? `${result.txCompleted}/${result.txTotal} transactions completed...` 
                                  : "Transaction in progress...") 
                              : "Waiting to start..."}
                          </span>
                        </div>
                        {/* Skip button */}
                        {status === "racing" && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => skipChain(result.chainId)}
                            className="ml-2 text-xs"
                          >
                            <SkipForward size={14} className="mr-1" />
                            Skip
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}