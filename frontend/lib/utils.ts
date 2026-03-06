import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves a content URL from the backend to a fully qualified, fetch-friendly URL.
 * Also repairs known CORS-problematic URLs (like w3schools) used in mock data.
 */
export function resolveContentUrl(contentUrl?: string): string {
  if (!contentUrl) return '';

  // Repair: replace CORS-problematic URLs (w3schools) with working ones
  if (contentUrl.includes('w3schools.com')) {
    const base = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');
    return `${base}/storage/html.mp4`;
  }

  // Handle absolute URLs
  if (contentUrl.startsWith('http')) return contentUrl;

  // Handle relative storage paths from backend
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');
  return `${base}${contentUrl}`;
}
