'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[v0] Error:', error);
  }, [error]);

  const isChunkError = error.message.includes('Failed to load chunk') || error.message.includes('Loading chunk');
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center bg-white shadow-xl border-t-4 border-red-500">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-50 p-3 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
        <p className="text-gray-600 mb-6">
          {isChunkError && isOffline
            ? "This part of the app hasn't been cached for offline use yet. Please connect to the internet to load this content."
            : "An error occurred while processing your request. Please try again."}
        </p>
        {(!isChunkError || !isOffline) && error.message && (
          <p className="text-xs text-gray-400 mb-6 bg-gray-50 p-3 rounded font-mono break-all line-clamp-2">
            {error.message}
          </p>
        )}
        <div className="flex gap-4">
          <Button onClick={() => reset()} className="flex-1">
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
            Go home
          </Button>
        </div>
      </Card>
    </div>
  );
}
