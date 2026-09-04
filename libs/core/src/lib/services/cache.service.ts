import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';

export const CACHE_CONFIG = new InjectionToken<CacheConfig>('CACHE_CONFIG');
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time-to-live in milliseconds
}

export interface CacheConfig {
  ttl?: number; // Default: 5 minutes
  enableLogging?: boolean;
}

/**
 * Selective API cache service
 * - Cache only appropriate endpoints (settings, profile, master-data, permissions)
 * - Skip transactional/realtime state
 * - Automatic expiration
 * - Invalidation support
 *
 * Usage:
 * - api.get('/api/settings', { cache: true })
 * - cacheService.invalidate('/api/settings')
 * - cacheService.clear()
 */
@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private enableLogging = false;

  constructor(@Optional() @Inject(CACHE_CONFIG) config?: CacheConfig) {
    this.defaultTTL = config?.ttl ?? 5 * 60 * 1000;
    this.enableLogging = config?.enableLogging ?? false;
  }

  /**
   * Get cached data if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.log(`Cache MISS: ${key}`);
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.log(`Cache EXPIRED: ${key}`);
      this.cache.delete(key);
      return null;
    }

    this.log(`Cache HIT: ${key}`);
    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });
    this.log(`Cache SET: ${key} (TTL: ${ttl ?? this.defaultTTL}ms)`);
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.log(`Cache INVALIDATED: ${key}`);
  }

  /**
   * Invalidate by pattern (e.g., '/api/settings*')
   */
  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let invalidated = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.log(`Cache INVALIDATED by pattern '${pattern}': ${invalidated} entries`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.log(`Cache CLEARED: ${size} entries removed`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
      })),
    };
  }

  private log(message: string): void {
    if (this.enableLogging) {
      console.log(`[CacheService] ${message}`);
    }
  }
}
