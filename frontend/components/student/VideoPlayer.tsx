'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface VideoPlayerProps {
  title: string;
  blobUrl?: string;
  contentUrl?: string;
  onComplete?: () => void;
  duration?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  blobUrl,
  contentUrl,
  onComplete,
  duration = 0,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleComplete = () => {
    setIsPlaying(false);
    onComplete?.();
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {/* Video Container */}
      <div className="relative bg-background aspect-video flex items-center justify-center">
        {(blobUrl || contentUrl) ? (
          <video
            key={blobUrl || contentUrl}
            src={blobUrl || contentUrl}
            className="w-full h-full"
            controls
            onEnded={handleComplete}
            autoPlay={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-primary-foreground">
            <Play className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-muted-foreground/80">Video content not available</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-muted/50 p-4 border-t border-border">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">Duration: {duration} minutes</p>
      </div>
    </div>
  );
};
