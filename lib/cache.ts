/**
 * Simple memory cache implementation for server-side caching
 * In production, consider using Redis or Vercel KV
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// In-memory cache store
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Cache a function's return value with an expiration time
 * @param key - Unique cache key
 * @param fn - Async function to execute and cache its result
 * @param ttlSeconds - Time to live in seconds (default: 1 hour)
 */
export async function cachedQuery<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 3600
): Promise<T> {
  const now = Date.now();
  const cacheKey = `zenoti:${key}`;
  
  // Check if cache exists and is valid
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiry > now) {
    console.log(`Cache hit for ${cacheKey}`);
    return cached.data as T;
  }
  
  // Cache miss or expired, execute function
  console.log(`Cache miss for ${cacheKey}, fetching fresh data`);
  const freshData = await fn();
  
  // Store in cache
  memoryCache.set(cacheKey, {
    data: freshData,
    expiry: now + (ttlSeconds * 1000)
  });
  
  return freshData;
}

/**
 * Clear a specific cache entry
 */
export function clearCache(key: string): boolean {
  return memoryCache.delete(`zenoti:${key}`);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  memoryCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let valid = 0;
  let expired = 0;
  
  memoryCache.forEach(entry => {
    if (entry.expiry > now) {
      valid++;
    } else {
      expired++;
    }
  });
  
  return {
    totalEntries: memoryCache.size,
    validEntries: valid,
    expiredEntries: expired
  };
} 