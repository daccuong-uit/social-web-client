import { Injectable } from '@angular/core';
import {
  RouteReuseStrategy,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';

/**
 * AppRouteReuseStrategy
 * =====================
 * Preserves detached component trees for a configurable set of root-level
 * routes so that navigating away (e.g. /home → /profile → /home) does NOT
 * destroy and recreate the component — keeping state and scroll intact.
 *
 * Behaviour summary:
 *  • shouldDetach  — return true for routes in KEEP_ALIVE_PATHS
 *  • store         — cache the detached handle
 *  • shouldAttach  — return true if a cached handle exists
 *  • retrieve      — return cached handle (Angular reattaches the subtree)
 *  • shouldReuseRoute — standard: reuse when navigating within the same component
 */

/**
 * Root-level route paths (without leading '/') that should be kept alive.
 * Add a path here to start preserving that shell between navigations.
 */
const KEEP_ALIVE_PATHS = new Set([
  'home',
  'profile',
  'friends/all',
  'reels',
  'media',
  'dashboard',
  'settings',
]);

@Injectable({ providedIn: 'root' })
export class AppRouteReuseStrategy implements RouteReuseStrategy {
  /** Map from route path key → detached handle */
  private cache = new Map<string, DetachedRouteHandle>();

  // ─── Internal helpers ────────────────────────────────────────────────────

  /**
   * Derive the root key (e.g., 'home', 'profile') for caching.
   * We get this from the first-level segment of the route tree.
   */
  private getRootKey(route: ActivatedRouteSnapshot): string {
    if (route.pathFromRoot.length > 1) {
      const topLevelRoute = route.pathFromRoot[1];
      // Use the path defined in the lazy wrapper routeConfig (e.g., 'home')
      return topLevelRoute.routeConfig?.path || '';
    }
    return '';
  }

  /**
   * We only want to detach/attach the Shell Component itself.
   * In the app's routing structure:
   * [0] = Root
   * [1] = Lazy module wrapper (e.g. path: 'home', no component)
   * [2] = Shell Component (e.g. path: '', component: HomeShellComponent)
   * 
   * This ensures we don't try to cache empty leaf routes or wrapper routes.
   */
  private isShellRoute(route: ActivatedRouteSnapshot): boolean {
    // Only target the component-bearing route at level 2
    if (route.pathFromRoot.length === 3 && route.component) {
      const rootKey = this.getRootKey(route);
      return KEEP_ALIVE_PATHS.has(rootKey);
    }
    return false;
  }

  // ─── RouteReuseStrategy API ──────────────────────────────────────────────

  /**
   * Called when navigating AWAY from a route.
   * Return true to detach (= preserve) the component tree.
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.isShellRoute(route);
  }

  /**
   * Angular calls this immediately after shouldDetach() returns true.
   * We store the handle keyed by the root key.
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.getRootKey(route);
    if (!key) return;

    if (handle) {
      this.cache.set(key, handle);
    } else {
      this.cache.delete(key);
    }
  }

  /**
   * Called when navigating TO a route.
   * Return true if we have a cached handle so Angular reattaches it.
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (!this.isShellRoute(route)) return false;
    const key = this.getRootKey(route);
    return this.cache.has(key);
  }

  /**
   * Angular calls this immediately after shouldAttach() returns true.
   * We return the stored handle so the component tree is reattached as-is.
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!this.isShellRoute(route)) return null;
    const key = this.getRootKey(route);
    return this.cache.get(key) ?? null;
  }

  /**
   * Standard behaviour: reuse the same route instance when config hasn't changed.
   * This is the default Angular behaviour and should almost always return true
   * for same-component navigations (e.g. query-param changes).
   */
  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot,
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  // ─── Utility ────────────────────────────────────────────────────────────

  /**
   * Programmatically evict a path from the cache.
   * Call this (e.g. on logout) to ensure stale component trees are not
   * reattached after the user re-authenticates.
   */
  evict(path: string): void {
    this.cache.delete(path);
  }

  /** Clear the entire cache — useful on logout / session reset. */
  evictAll(): void {
    this.cache.clear();
  }
}
