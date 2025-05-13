"use client";

import { useChainRaceContext } from "@/providers/ChainRaceProvider";
import { type RaceResult } from "@/hooks/useChainRace";
import { Badge, Card, CardContent } from "@/components/ui";
import { Loader2, XCircle, Trophy, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";

export function ChainRace() {
  const { results } = useChainRaceContext();
  
  // Sort by chainId to maintain consistent lane order, regardless of race position
  const sortedResults = [...results];
  
  // Check if the race is finished
  const { status } = useChainRaceContext();
  const isRaceFinished = status === "finished";
  
  return (
    <Card className="w-full overflow-hidden relative">
      {/* Top banner with sky and clouds */}
      <div className="w-full bg-blue-100" style={{ marginBottom: "-4px", fontSize: 0, lineHeight: 0 }}>
        <div className="relative w-full" style={{ fontSize: 0, lineHeight: 0 }}>
          <Image
            src="/top.png"
            alt="Chain Derby Banner"
            width={1000}
            height={200}
            className="w-full block"
            style={{ 
              objectFit: "cover", 
              display: "block", 
              marginBottom: 0
            }}
          />
        </div>
      </div>
      
      <CardContent className="p-0 relative" style={{ marginTop: "-4px", fontSize: 0, lineHeight: 0 }}>
        {/* Race tracks container with absolute positioning for precise control */}
        <div className="mt-[-30px] relative" style={{ 
          fontSize: "16px", 
          lineHeight: "normal",
          height: `${Math.min(results.length * 120, 720)}px` // Height based on number of tracks
        }}>
          {sortedResults.map((result, index) => (
            <div 
              key={result.chainId} 
              className="transition-all duration-1000 ease-in-out" 
              style={{ 
                position: "absolute",
                top: `${index * 120}px`,
                left: 0,
                right: 0,
                height: "120px"
              }}
              data-position={result.position}
            >
              <ChainRaceTrack result={result} index={index} />
            </div>
          ))}
        </div>
        
        {/* Bottom grass image */}
        <div className="w-full mt-[-0px]">
          <div className="relative w-full">
            <Image
              src="/bottom.png"
              alt="Grass"
              width={1000}
              height={120}
              className="w-full"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        
        {/* Race results have been removed as requested */}
      </CardContent>
    </Card>
  );
}

function ChainRaceTrack({ result, index }: { result: RaceResult, index: number }) {
  // Calculate horse position as percentage with discrete steps
  let position = 0;
  
  if (result.status === "success") {
    position = 100; // Move finish line closer to the right edge
  } else if (result.status === "racing") {
    if (result.txTotal > 1) {
      // Base progress on transaction completion with discrete steps, starting at 25%
      const minPosition = 25; // Start at 25% of the track
      const raceDistance = 70; // Race over the middle 70% of the track (25% to 95%)
      const stepSize = raceDistance / result.txTotal;
      position = minPosition + Math.floor(result.txCompleted * stepSize);
    } else {
      // For single transaction races, set closer positions to avoid big jumps
      position = result.txHash ? 45 : 25;
    }
  } else if (result.status === "error") {
    // If error, show at a fixed position
    position = 30;
  }
  
  // Animation styles for horses - only animate during the race
  const animation = 
    result.status === "racing" ? 
      "animation: horse-run 500ms infinite ease-in-out" : 
      "";
      
  // Determine if this track should get a highlight effect (just finished)
  const shouldHighlight = result.status === "success" && result.position && result.position <= 3;
  
  return (
    <div className="relative h-30 my-0">
      {/* Highlight overlay for successful finish */}
      {shouldHighlight && (
        <div className="absolute inset-0 w-full h-full z-10 animate-pulse" 
          style={{ 
            backgroundColor: `${result.position === 1 ? "rgba(255, 215, 0, 0.15)" : 
                              result.position === 2 ? "rgba(192, 192, 192, 0.15)" : 
                              "rgba(205, 127, 50, 0.15)"}`,
            borderRadius: "4px",
            pointerEvents: "none"
          }}>
        </div>
      )}
      
      {/* Trophy positioned to the right side of the track for top 3 finishers */}
      {result.status === "success" && result.position && result.position <= 3 && (
        <div className="absolute right-[20%] top-1/2 -translate-y-1/2 z-20 rounded-full p-2 flex items-center justify-center" 
          style={{
            background: result.position === 1 
              ? 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.4) 70%, rgba(255,215,0,0) 100%)' 
              : result.position === 2
                ? 'radial-gradient(circle, rgba(192,192,192,0.8) 0%, rgba(192,192,192,0.4) 70%, rgba(192,192,192,0) 100%)'
                : 'radial-gradient(circle, rgba(205,127,50,0.8) 0%, rgba(205,127,50,0.4) 70%, rgba(205,127,50,0) 100%)',
            width: '100px',
            height: '100px',
            boxShadow: '0 0 15px rgba(0,0,0,0.2)'
          }}>
          <Trophy className="h-14 w-14" style={{ 
            color: result.position === 1 ? "#FFD700" : // Gold
                   result.position === 2 ? "#C0C0C0" : // Silver
                   "#CD7F32",                          // Bronze
            filter: 'drop-shadow(0px 0px 5px rgba(0,0,0,0.3))'
          }} />
        </div>
      )}
      
      {/* Confetti effect for 1st place */}
      {result.position === 1 && result.status === "success" && (
        <>
          {[...Array(10)].map((_, i) => (
            <div 
              key={i}
              className="absolute z-20 w-2 h-2 rounded-full pointer-events-none"
              style={{
                left: `${20 + (i * 10)}%`,
                top: "0",
                backgroundColor: ['#FFD700', '#FF8C00', '#FF1493', '#00BFFF', '#32CD32'][i % 5],
                animation: `confetti-fall ${0.5 + (i * 0.1)}s ease-out forwards`,
                animationDelay: `${0.1 * i}s`
              }}
            />
          ))}
        </>
      )}
      
      {/* Track background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/track.png"
          alt="Race Track"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      
      {/* Chain name label on the left */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-lg px-3 py-2 shadow-md min-w-[240px]">
        <div className="flex items-center gap-3">
          {/* Chain logo */}
          <div className="flex-shrink-0">
            <Image 
              src={result.logo || "/logos/rise.png"}
              alt={`${result.name} Logo`}
              width={36}
              height={36}
              style={{ 
                borderRadius: "50%",
                boxShadow: "0 0 4px rgba(0,0,0,0.2)"
              }}
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-black truncate">{result.name}</span>
              {result.status === "success" && result.position && result.position <= 3 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  result.position === 1 ? "bg-yellow-100 text-yellow-800" :
                  result.position === 2 ? "bg-gray-100 text-gray-700" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {result.position === 1 ? (
                    <span className="flex items-center gap-0.5">
                      <Trophy className="h-2.5 w-2.5" /> 1st
                    </span>
                  ) : result.position === 2 ? "2nd" : "3rd"}
                </span>
              )}
            </div>
            <div className="flex flex-col text-xs text-gray-600 mt-0.5">
              {result.status === "success" && result.averageLatency && (
                <div className="flex justify-between gap-2">
                  <span className="flex items-center font-medium">
                    <Clock size={10} className="inline mr-1" /> {result.averageLatency}ms avg
                  </span>
                  {result.totalLatency && (
                    <span className="text-gray-500">
                      {(result.totalLatency / 1000).toFixed(2)}s total
                    </span>
                  )}
                </div>
              )}
              {result.status === "racing" && (
                <span className="flex items-center">
                  <Loader2 size={10} className="inline mr-1 animate-spin" /> 
                  {result.txCompleted}/{result.txTotal} tx
                </span>
              )}
              {result.status === "error" && (
                <span className="flex items-center text-red-500">
                  <XCircle size={10} className="inline mr-1" /> Failed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Horse on the track */}
      <div 
        className="absolute top-1/2"
        style={{ 
          right: `${100 - position}%`, 
          transform: `translateY(-80%)`, /* Move horses down by adjusting translateY from -50% to -30% */
          zIndex: result.status === "error" ? 1 : 5,
          width: "220px",
          height: "170px",
          transition: "right 0.3s ease-out"
        }}
      >
        {result.status !== "pending" && (
          <div className="relative" style={{ animation }}>
            <div className="relative">
              <Image 
                src="/horse.png" 
                alt={`${result.name} Horse`} 
                width={220} 
                height={170}
                className={result.status === "error" ? "opacity-50" : ""}
                style={{ 
                  transform: "scaleX(1)", // Face horse right-to-left
                  width: "220px", 
                  height: "170px",
                  objectFit: "contain" 
                }}
              />
              
              {/* Chain logo on the white square of the horse */}
              <div className="absolute" style={{ left: "78px", top: "73px" }}>
                <Image 
                  src={result.logo || "/logos/rise.png"}
                  alt={`${result.name} Logo`}
                  width={32}
                  height={32}
                  style={{ 
                    borderRadius: "50%",
                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                    padding: "2px",
                    width: "32px",
                    height: "32px"
                  }}
                />
              </div>
            </div>
            
            {/* Horse trophy removed as requested */}
          </div>
        )}
      </div>
    </div>
  );
}