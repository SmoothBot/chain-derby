"use client";

import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { type RaceResult } from "@/hooks/useChainRace";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Loader2, Clock, XCircle, Trophy, CheckCircle } from "lucide-react";

export function ChainRace() {
  const { results } = useChainRaceContext();
  
  // Sort results by position for the display
  const sortedResults = [...results].sort((a, b) => {
    // First by position if available
    if (a.position && b.position) {
      return a.position - b.position;
    }
    
    // Then success first
    if (a.status === "success" && b.status !== "success") return -1;
    if (a.status !== "success" && b.status === "success") return 1;
    
    // Then racing
    if (a.status === "racing" && b.status !== "racing") return -1;
    if (a.status !== "racing" && b.status === "racing") return 1;
    
    // Then by chain ID
    return a.chainId - b.chainId;
  });
  
  // Check if the race is finished
  const { status } = useChainRaceContext();
  const isRaceFinished = status === "finished";
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chain Derby</CardTitle>
        {isRaceFinished && (
          <div className="text-sm font-medium text-muted-foreground">
            Race Results
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Start line */}
          <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-border-primary" />
          
          {/* Finish line */}
          <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-border-primary" style={{ 
            backgroundImage: 'repeating-linear-gradient(0deg, black, black 5px, white 5px, white 10px)' 
          }} />
          
          {/* Race track */}
          <div className="space-y-8 py-4">
            {sortedResults.map((result) => (
              <ChainRaceTrack key={result.chainId} result={result} />
            ))}
          </div>
        </div>
        
        {/* Race results table when finished */}
        {isRaceFinished && sortedResults.some(r => r.position) && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Leaderboard</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-black dark:text-white">
                    <th className="text-left py-2 px-4">Position</th>
                    <th className="text-left py-2 px-4">Chain</th>
                    <th className="text-left py-2 px-4">Avg. Latency</th>
                    <th className="text-left py-2 px-4">Total Latency</th>
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-black dark:text-white">
                  {sortedResults.map((result) => (
                    <tr key={result.chainId} className="border-b">
                      <td className="py-3 px-4">
                        {result.position || '-'}
                        {result.position === 1 && <Trophy className="h-4 w-4 text-yellow-500 inline ml-1" />}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{result.emoji}</span>
                          <span className="text-black dark:text-white">
                            {result.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{result.averageLatency ? `${result.averageLatency}ms` : '-'}</td>
                      <td className="py-3 px-4">{result.totalLatency ? `${result.totalLatency}ms` : '-'}</td>
                      <td className="py-3 px-4">
                        {result.status === "success" ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle size={14} /> Success
                          </div>
                        ) : result.status === "error" ? (
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle size={14} /> {result.error || "Failed"}
                          </div>
                        ) : (
                          result.status
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChainRaceTrack({ result }: { result: RaceResult }) {
  // Calculate horse position as percentage with discrete steps
  let position = 0;
  
  if (result.status === "success") {
    position = 100;
  } else if (result.status === "racing") {
    if (result.txTotal > 1) {
      // Base progress on transaction completion with discrete steps
      // Calculate the width of each step (each transaction)
      const stepSize = 95 / result.txTotal;
      // Position is based on completed transactions, not a smooth percentage
      position = Math.floor(result.txCompleted * stepSize);
      
      // Ensure we're showing discrete transaction steps
      console.log(`Chain ${result.name}: ${result.txCompleted}/${result.txTotal} txs = ${position}%`);
    } else {
      // For single transaction races, just show a fixed position
      position = result.txHash ? 50 : 10; // Either starting or halfway done
    }
  } else if (result.status === "error") {
    // If error, show at a fixed position
    position = 30;
  }
  
  return (
    <div className="relative">
      {/* Chain name and indicator */}
      <div className="flex items-center absolute left-0 top-1/2 -translate-y-1/2">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: `${result.color}25` }}
        >
          {result.emoji}
        </div>
      </div>
      
      {/* Track */}
      <div className="h-12 ml-12 mr-6 rounded-md bg-accent/15 relative">
        {/* Chain name (displayed on the track) */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-medium z-10 text-black dark:text-white">
          {result.name}
        </div>
        
        {/* Horse position */}
        <div 
          className="absolute top-0 left-0 h-full"
          style={{ 
            width: `${position}%`, 
            backgroundColor: result.status === "error" ? "#FF000015" : `${result.color}30`,
            borderRight: result.status === "error" ? "2px dashed red" : "none",
            transition: "none" // Remove all transition effects
          }}
        >
          {/* Horse emoji */}
          {result.status !== "pending" && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-3xl animate-pulse">
              {result.emoji}
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2  mr-10">
          {result.status === "pending" && (
            <Badge variant="outline" className="bg-background flex items-center gap-1">
              <Clock size={14} /> Pending
            </Badge>
          )}
          
          {result.status === "racing" && (
            <Badge variant="outline" className="bg-background flex items-center gap-1">
              <Loader2 size={14} className="animate-spin" /> 
              {result.txTotal > 1 
                ? `${result.txCompleted}/${result.txTotal} tx` 
                : "Racing"}
            </Badge>
          )}
          
          {result.status === "success" && (
            <>
              <Badge 
                variant="outline" 
                className="bg-background flex items-center gap-1"
                style={{ borderColor: result.color }}
              >
                <CheckCircle size={14} className="text-green-500" /> 
                {result.averageLatency 
                  ? `${result.averageLatency}ms avg / ${result.totalLatency}ms total` 
                  : "Done"}
              </Badge>
              
              {result.position === 1 && (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
              
              {result.position === 2 && (
                <Trophy className="h-5 w-5 text-gray-400" />
              )}
              
              {result.position === 3 && (
                <Trophy className="h-5 w-5 text-amber-700" />
              )}
            </>
          )}
          
          {result.status === "error" && (
            <Badge variant="outline" className="bg-background flex items-center gap-1 border-red-500">
              <XCircle size={14} className="text-red-500" /> Failed
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}