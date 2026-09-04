import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpContext } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { appConfig } from '../config/app-config';
import { CacheService } from './cache.service';

export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    timestamp?: string;
    path?: string;
    pagination?: {
      currentPage?: number;
      totalPages?: number;
      totalItems?: number;
      itemsPerPage?: number;
      hasNext?: boolean;
      nextCursor?: string;
    };
    [key: string]: unknown;
  };
}

export interface ApiOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  observe?: 'body';
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  context?: HttpContext;
  cache?: boolean | number; // Enable cache or specify TTL in ms
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private readonly apiBase = appConfig.apiUrl;

  /**
   * Remove cache option from ApiOptions to avoid passing to HttpClient
   */
  private sanitizeOptions(options?: ApiOptions): Omit<ApiOptions, 'cache'> {
    if (!options) return {};
    const { cache, ...sanitized } = options;
    return sanitized;
  }

  /**
   * Generate cache key from path and params
   */
  private getCacheKey(path: string, params?: HttpParams | Record<string, unknown>): string {
    let key = path;
    if (params) {
      if (params instanceof HttpParams) {
        key += `?${params.toString()}`;
      } else {
        key += `?${JSON.stringify(params)}`;
      }
    }
    return key;
  }

  get<T>(path: string, options?: ApiOptions): Observable<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(path, options?.params);
    const cacheConfig = options?.cache;

    // Check cache first
    if (cacheConfig) {
      const cached = this.cache.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        return of(cached);
      }
    }

    // Fetch from API
    const sanitized = this.sanitizeOptions(options);
    return this.http.get<ApiResponse<T>>(`${this.apiBase}${path}`, sanitized).pipe(
      map(data => {
        // Store in cache if enabled
        if (cacheConfig) {
          const ttl = typeof cacheConfig === 'number' ? cacheConfig : undefined;
          this.cache.set(cacheKey, data, ttl);
        }
        return data;
      })
    );
  }

  post<T>(path: string, body: unknown = {}, options?: ApiOptions): Observable<ApiResponse<T>> {
    const sanitized = this.sanitizeOptions(options);
    return this.http.post<ApiResponse<T>>(`${this.apiBase}${path}`, body, sanitized);
  }

  put<T>(path: string, body: unknown, options?: ApiOptions): Observable<ApiResponse<T>> {
    const sanitized = this.sanitizeOptions(options);
    return this.http.put<ApiResponse<T>>(`${this.apiBase}${path}`, body, sanitized);
  }

  delete<T>(path: string, options?: ApiOptions): Observable<ApiResponse<T>> {
    const sanitized = this.sanitizeOptions(options);
    return this.http.delete<ApiResponse<T>>(`${this.apiBase}${path}`, sanitized);
  }
}

