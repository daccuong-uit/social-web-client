import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * TabKeepAliveService
 *
 * Coordinates between SidebarMenuComponent / BottomMenuComponent and
 * feature pages to implement two behaviours:
 *
 *  1. Switch tab  → Keep-Alive (no destroy, no refetch).
 *     The active tab signal drives visibility (`[hidden]`) on the host shell.
 *
 *  2. Re-click active tab → scroll to top + refetch API.
 *     The `refresh$` Subject emits the route path so only the matching
 *     feature component reacts.
 */
@Injectable({ providedIn: 'root' })
export class TabKeepAliveService {
  /**
   * The route path that is currently visible, e.g. '/home', '/home/discover'.
   * Set by the hosting shell on NavigationEnd, and by the menu on active-tab click.
   */
  readonly activeRoute = signal<string>('');

  /**
   * Emits the route path whenever the user clicks the *already-active* tab.
   * Feature components subscribe and filter by their own route.
   */
  readonly refresh$ = new Subject<string>();

  /**
   * Called by the hosting shell (or router events) to update the active route
   * without triggering a refresh.
   */
  setActiveRoute(routePath: string): void {
    this.activeRoute.set(routePath);
  }

  /**
   * Called by SidebarMenuComponent / BottomMenuComponent when the user clicks
   * the tab that is already active. Emits on `refresh$` so the feature
   * component can scroll to top and refetch.
   */
  triggerRefresh(routePath: string): void {
    this.activeRoute.set(routePath);
    this.refresh$.next(routePath);
  }

  /**
   * Convenience: returns an Observable that emits only when `routePath` is
   * refreshed, so callers don't need to filter themselves.
   */
  refreshFor(routePath: string) {
    return this.refresh$.pipe(filter((path) => path === routePath));
  }
}
