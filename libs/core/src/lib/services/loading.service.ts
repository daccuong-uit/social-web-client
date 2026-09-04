import { Injectable, signal, computed } from '@angular/core';

export interface LoadingState {
  global: boolean;
  route: boolean;
  button: Record<string, boolean>;
  table: Record<string, boolean>;
  page: Record<string, boolean>;
  custom: Record<string, boolean>;
}

/**
 * Centralized loading state management
 * Manages multiple loading contexts with fine-grained control
 * - Global loading (spinners, page overlays)
 * - Route/page loading
 * - Button-level loading
 * - Table/list loading
 * - Custom named loading states
 *
 * Uses Angular Signals for reactive state updates
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Individual loading states
  private globalLoading = signal(false);
  private routeLoading = signal(false);
  private buttonLoading = signal<Record<string, boolean>>({});
  private tableLoading = signal<Record<string, boolean>>({});
  private pageLoading = signal<Record<string, boolean>>({});
  private customLoading = signal<Record<string, boolean>>({});

  // Expose as readonly signals
  globalLoading$ = this.globalLoading.asReadonly();
  routeLoading$ = this.routeLoading.asReadonly();
  buttonLoading$ = this.buttonLoading.asReadonly();
  tableLoading$ = this.tableLoading.asReadonly();
  pageLoading$ = this.pageLoading.asReadonly();
  customLoading$ = this.customLoading.asReadonly();

  // Computed: Is any loading happening?
  isLoading = computed(() => {
    return (
      this.globalLoading() ||
      this.routeLoading() ||
      Object.values(this.buttonLoading()).some(v => v) ||
      Object.values(this.tableLoading()).some(v => v) ||
      Object.values(this.pageLoading()).some(v => v) ||
      Object.values(this.customLoading()).some(v => v)
    );
  });

  // --- Global Loading ---

  /**
   * Set global loading state (for app-level spinners, overlays)
   */
  setGlobalLoading(isLoading: boolean): void {
    this.globalLoading.set(isLoading);
  }

  /**
   * Get current global loading state
   */
  isGlobalLoading(): boolean {
    return this.globalLoading();
  }

  /**
   * Start global loading
   */
  startGlobalLoading(): void {
    this.setGlobalLoading(true);
  }

  /**
   * Stop global loading
   */
  stopGlobalLoading(): void {
    this.setGlobalLoading(false);
  }

  // --- Route/Page Loading ---

  /**
   * Set route loading state (when navigating between pages)
   */
  setRouteLoading(isLoading: boolean): void {
    this.routeLoading.set(isLoading);
  }

  /**
   * Get current route loading state
   */
  isRouteLoading(): boolean {
    return this.routeLoading();
  }

  /**
   * Start route loading
   */
  startRouteLoading(): void {
    this.setRouteLoading(true);
  }

  /**
   * Stop route loading
   */
  stopRouteLoading(): void {
    this.setRouteLoading(false);
  }

  // --- Button Loading ---

  /**
   * Set loading state for a specific button
   * @param key Unique button identifier (e.g., 'submit-btn', 'delete-btn')
   * @param isLoading Loading state
   */
  setButtonLoading(key: string, isLoading: boolean): void {
    const current = this.buttonLoading();
    if (isLoading) {
      this.buttonLoading.set({ ...current, [key]: true });
    } else {
      const updated = { ...current };
      delete updated[key];
      this.buttonLoading.set(updated);
    }
  }

  /**
   * Check if a specific button is loading
   */
  isButtonLoading(key: string): boolean {
    return !!this.buttonLoading()[key];
  }

  /**
   * Start button loading
   */
  startButtonLoading(key: string): void {
    this.setButtonLoading(key, true);
  }

  /**
   * Stop button loading
   */
  stopButtonLoading(key: string): void {
    this.setButtonLoading(key, false);
  }

  // --- Table/List Loading ---

  /**
   * Set loading state for a specific table
   * @param key Table identifier (e.g., 'users-table', 'products-list')
   * @param isLoading Loading state
   */
  setTableLoading(key: string, isLoading: boolean): void {
    const current = this.tableLoading();
    if (isLoading) {
      this.tableLoading.set({ ...current, [key]: true });
    } else {
      const updated = { ...current };
      delete updated[key];
      this.tableLoading.set(updated);
    }
  }

  /**
   * Check if a specific table is loading
   */
  isTableLoading(key: string): boolean {
    return !!this.tableLoading()[key];
  }

  /**
   * Start table loading
   */
  startTableLoading(key: string): void {
    this.setTableLoading(key, true);
  }

  /**
   * Stop table loading
   */
  stopTableLoading(key: string): void {
    this.setTableLoading(key, false);
  }

  // --- Page Loading ---

  /**
   * Set loading state for a specific page section
   * @param key Page/section identifier (e.g., 'dashboard-page', 'user-details')
   * @param isLoading Loading state
   */
  setPageLoading(key: string, isLoading: boolean): void {
    const current = this.pageLoading();
    if (isLoading) {
      this.pageLoading.set({ ...current, [key]: true });
    } else {
      const updated = { ...current };
      delete updated[key];
      this.pageLoading.set(updated);
    }
  }

  /**
   * Check if a specific page is loading
   */
  isPageLoading(key: string): boolean {
    return !!this.pageLoading()[key];
  }

  /**
   * Start page loading
   */
  startPageLoading(key: string): void {
    this.setPageLoading(key, true);
  }

  /**
   * Stop page loading
   */
  stopPageLoading(key: string): void {
    this.setPageLoading(key, false);
  }

  // --- Custom Loading ---

  /**
   * Set loading state for a custom operation
   * @param key Custom operation identifier
   * @param isLoading Loading state
   */
  setCustomLoading(key: string, isLoading: boolean): void {
    const current = this.customLoading();
    if (isLoading) {
      this.customLoading.set({ ...current, [key]: true });
    } else {
      const updated = { ...current };
      delete updated[key];
      this.customLoading.set(updated);
    }
  }

  /**
   * Check if a custom operation is loading
   */
  isCustomLoading(key: string): boolean {
    return !!this.customLoading()[key];
  }

  /**
   * Start custom loading
   */
  startCustomLoading(key: string): void {
    this.setCustomLoading(key, true);
  }

  /**
   * Stop custom loading
   */
  stopCustomLoading(key: string): void {
    this.setCustomLoading(key, false);
  }

  // --- Utilities ---

  /**
   * Get full loading state snapshot
   */
  getLoadingState(): LoadingState {
    return {
      global: this.globalLoading(),
      route: this.routeLoading(),
      button: this.buttonLoading(),
      table: this.tableLoading(),
      page: this.pageLoading(),
      custom: this.customLoading(),
    };
  }

  /**
   * Reset all loading states
   */
  resetAll(): void {
    this.globalLoading.set(false);
    this.routeLoading.set(false);
    this.buttonLoading.set({});
    this.tableLoading.set({});
    this.pageLoading.set({});
    this.customLoading.set({});
  }

  /**
   * Run an async operation with automatic loading state
   * @param key Loading state key
   * @param operation Async operation (Promise or Observable)
   * @param context Which loading context to use (default: 'custom')
   * @returns Promise that resolves when operation completes
   */
  async withLoading<T>(
    key: string,
    operation: Promise<T> | (() => Promise<T>),
    context: 'global' | 'button' | 'table' | 'page' | 'custom' = 'custom'
  ): Promise<T> {
    this.setLoading(context, key, true);
    try {
      const result = typeof operation === 'function' ? await operation() : await operation;
      return result;
    } finally {
      this.setLoading(context, key, false);
    }
  }

  /**
   * Set loading state based on context
   */
  private setLoading(context: string, key: string, isLoading: boolean): void {
    switch (context) {
      case 'global':
        this.setGlobalLoading(isLoading);
        break;
      case 'button':
        this.setButtonLoading(key, isLoading);
        break;
      case 'table':
        this.setTableLoading(key, isLoading);
        break;
      case 'page':
        this.setPageLoading(key, isLoading);
        break;
      case 'custom':
        this.setCustomLoading(key, isLoading);
        break;
    }
  }
}
