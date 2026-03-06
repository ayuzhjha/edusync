import { db, dbUtils } from './db';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API Service with JWT attachment and error handling
export const apiService = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',

  async getToken(): Promise<string | null> {
    const sessions = await db.sessions.toArray();
    if (sessions.length > 0 && sessions[0].expiresAt > Date.now()) {
      return sessions[0].token;
    }
    return null;
  },

  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      console.log(`[v0] API: ${method} ${endpoint}`);

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (response.status === 401) {
        // Unauthorized - clear auth and let AuthContext handle redirect
        const sessions = await db.sessions.toArray();
        if (sessions.length > 0) {
          await dbUtils.deleteSession(sessions[0].userId);
        }
        window.dispatchEvent(new CustomEvent('auth-expired'));
        throw new APIError(401, 'Unauthorized');
      }

      if (!response.ok) {
        const error = await response.text();
        throw new APIError(response.status, error || `HTTP ${response.status}`);
      }

      const result: APIResponse<T> = await response.json();

      if (!result.success) {
        throw new APIError(400, result.error || 'API returned error');
      }

      return result.data as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      // Network error or parsing error
      console.error('[v0] API error:', error);
      throw new APIError(0, error instanceof Error ? error.message : 'Network error', error);
    }
  },

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  },

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  },

  // File/blob download with progress tracking
  async downloadBlob(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const token = await this.getToken();
    const headers: HeadersInit = {};

    // Only attach token if it's an internal API call or a relative path
    const isInternal =
      url.startsWith('/') ||
      url.startsWith(this.baseUrl) ||
      (typeof window !== 'undefined' && url.startsWith(window.location.origin));

    if (token && isInternal) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new APIError(response.status, `Download failed: HTTP ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    if (!contentLength) {
      return response.blob();
    }

    const total = parseInt(contentLength, 10);
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) {
      return response.blob();
    }

    const chunks: Uint8Array[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;
        onProgress?.(Math.round((loaded / total) * 100));
      }
    } finally {
      reader.releaseLock();
    }

    return new Blob(chunks as any as BlobPart[], { type: response.headers.get('content-type') || 'application/octet-stream' });
  },

  // Check if network is available
  isOnline(): boolean {
    return navigator.onLine;
  },

  // Get connection quality
  getConnectionQuality(): 'fast' | 'slow' | 'unknown' {
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (connection?.effectiveType) {
      const type = connection.effectiveType;
      if (type === '2g' || type === 'slow-2g' || type === '3g') {
        return 'slow';
      }
      return 'fast';
    }

    return 'unknown';
  },
};

// Offline-first data fetching pattern
export async function fetchOfflineFirst<T>(
  key: string,
  fetchFn: () => Promise<T>,
  cacheTime: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  try {
    // Try to get from IndexedDB cache
    const cached = await db.table('cache').get?.(key);
    if (cached && cached.timestamp + cacheTime > Date.now()) {
      console.log(`[v0] Cache hit for ${key}`);
      return cached.data as T;
    }

    // If online, fetch fresh data
    if (apiService.isOnline()) {
      const data = await fetchFn();

      // Update cache
      if (db.table('cache')) {
        await db.table('cache').put({
          key,
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    }

    // Offline and no fresh cache - return stale cache or throw
    if (cached) {
      console.log(`[v0] Using stale cache for ${key}`);
      return cached.data as T;
    }

    throw new Error(`No data available for ${key}`);
  } catch (error) {
    console.error(`[v0] Error fetching ${key}:`, error);
    throw error;
  }
}
