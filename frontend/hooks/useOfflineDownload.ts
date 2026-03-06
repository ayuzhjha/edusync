import { useState } from 'react';
import { db } from '../lib/db'; // Ensure this points to your Dexie instance

export const useOfflineDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const downloadLessonVideo = async (lessonId: string, videoUrl: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // 1. Fetch the video data
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error("Failed to fetch video stream");

      const blob = await response.blob();

      // 2. Store in the 'assets' table matching your schema
      // We use the lessonId as the primary 'id' for the asset
      // Optimized for your existing schema
        await db.assets.put({
        id: lessonId,
        blob: blob,
        mimeType: blob.type, // This now matches the interface
        updatedAt: Date.now()
        // Remove contentType and updatedAt if you didn't add them to the interface above
        });

      // 3. Mark the lesson as 'downloaded' in the lessons table
      await db.lessons.update(lessonId, { isOffline: true });

      setDownloadProgress(100);
    } catch (error) {
      console.error("Offline Save Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadLessonVideo, isDownloading, downloadProgress };
};