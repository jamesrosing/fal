/**
 * Simple memory cache implementation 
 * For production, consider using Redis or Vercel KV
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
  
  // Check if cache exists and is valid
  const cached = memoryCache.get(key);
  if (cached && cached.expiry > now) {
    console.log(`Cache hit for ${key}`);
    return cached.data as T;
  }
  
  // Cache miss or expired, execute function
  console.log(`Cache miss for ${key}, fetching fresh data`);
  const freshData = await fn();
  
  // Store in cache
  memoryCache.set(key, {
    data: freshData,
    expiry: now + (ttlSeconds * 1000)
  });
  
  return freshData;
}

/**
 * Clear a specific cache entry
 */
export function clearCache(key: string): boolean {
  return memoryCache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  memoryCache.clear();
}

/**
 * Clear all Zenoti-related cache entries
 * @returns The number of cache entries cleared
 */
export function clearZenotiCache(): number {
  let count = 0;
  
  // Iterate through all cache keys and delete those starting with 'zenoti:'
  // Using Array.from to convert the iterator to an array for compatibility
  Array.from(memoryCache.keys()).forEach(key => {
    if (key.startsWith('zenoti:')) {
      memoryCache.delete(key);
      count++;
    }
  });
  
  console.log(`Cleared ${count} Zenoti cache entries`);
  return count;
}