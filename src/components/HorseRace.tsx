"use client";

import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { type RaceResult } from "@/hooks/useChainRace";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Loader2, Clock, XCircle, Trophy, CheckCircle } from "lucide-react";

export function HorseRace() {
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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Horse Race</CardTitle>
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
              <HorseRaceTrack key={result.chainId} result={result} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HorseRaceTrack({ result }: { result: RaceResult }) {
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
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
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