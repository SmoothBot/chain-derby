"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Button
} from "./ui";
import { Twitter, Download, Copy } from "lucide-react";
import { shareRaceResults } from "@/lib/utils";

interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  winnerName: string;
  winnerTime: number;
  totalChains: number;
}

export function SharePreviewModal({
  isOpen,
  onClose,
  imageDataUrl,
  winnerName,
  winnerTime,
  totalChains
}: Readonly<SharePreviewModalProps>) {
  const [isSharingToTwitter, setIsSharingToTwitter] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  // Generate tweet text
  const tweetText = `🏆 ${winnerName} just won my Chain Derby race with a blazing fast ${winnerTime}ms transaction time! Raced against ${totalChains} different blockchains.`;
  
  const handleShareToTwitter = async () => {
    try {
      setIsSharingToTwitter(true);
      await shareRaceResults(winnerName, winnerTime, totalChains, imageDataUrl);
    } catch (error) {
      console.error("Error sharing to Twitter:", error);
    } finally {
      setIsSharingToTwitter(false);
      onClose();
    }
  };
  
  const handleDownloadImage = async () => {
    if (!imageDataUrl) return;
    
    try {
      setIsDownloading(true);
      
      // Convert data URL to blob for download
      const blob = await fetch(imageDataUrl).then(r => r.blob());
      
      // Create a download link for the image
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'chain-derby-results.png';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleCopyText = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(tweetText);
      // Show success for a moment
      setTimeout(() => {
        setIsCopying(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      setIsCopying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Race Results</DialogTitle>
          <DialogDescription>
            Preview and share your Chain Derby race results
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-4">
          {/* Image Preview */}
          {imageDataUrl ? (
            <div className="relative rounded-lg border overflow-hidden bg-muted/20">
              <div className="aspect-[3/2] max-h-[400px] w-full overflow-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imageDataUrl} 
                  alt="Race Results" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          ) : (
            <div className="aspect-[3/2] flex items-center justify-center rounded-lg border bg-muted/20">
              <p className="text-muted-foreground">Image preview not available</p>
            </div>
          )}
          
          {/* Text Preview */}
          <div className="rounded-lg border p-3 bg-card">
            <h3 className="font-medium text-sm mb-2">Tweet Text</h3>
            <p className="text-sm text-muted-foreground">{tweetText}</p>
            <div className="mt-2 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyText}
                className="text-xs"
              >
                {isCopying ? "Copied!" : "Copy Text"}
                <Copy className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleDownloadImage}
            disabled={!imageDataUrl || isDownloading}
          >
            {isDownloading ? "Downloading..." : "Download Image"}
            <Download className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={handleShareToTwitter}
            disabled={isSharingToTwitter}
            className="bg-[#1DA1F2] hover:bg-[#1a94df] text-white"
          >
            {isSharingToTwitter ? "Opening Twitter..." : "Share on Twitter"}
            <Twitter className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}