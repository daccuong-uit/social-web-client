import { HttpContext } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiResponse, ApiService } from './api.service';
import { catchError, of, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { urlConfig } from '../config/url-config';
import { showGlobalLoading } from '../interceptors/loading.interceptor';
import { AppRouteReuseStrategy } from './route-reuse.strategy';

export interface User {
  id: string;
  userId?: string;
  email: string;
  username?: string;
  displayName?: string;
}

export interface AuthResponse {
  accountId: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private reuseStrategy = inject(AppRouteReuseStrategy);
  private readonly USER_KEY = 'user';
  private _user = signal<User | null>(null);
  
  user = this._user.asReadonly();
  isAuthenticated = computed(() => !!this._user());

  login(credentials: Record<string, unknown>) {
    const context = new HttpContext().set(showGlobalLoading, true);

    return this.api.post<AuthResponse>(urlConfig.auth.login, credentials, { context }).pipe(
      map((res: ApiResponse<AuthResponse>) => res.data),
      tap((auth: AuthResponse) => this.storeTokens(auth)),
      switchMap(() => this.fetchProfile(true))
    );
  }

  register(data: Record<string, unknown>) {
    const context = new HttpContext().set(showGlobalLoading, true);

    return this.api.post<AuthResponse>(urlConfig.auth.register, data, { context }).pipe(
      map((res: ApiResponse<AuthResponse>) => res.data),
      tap((auth: AuthResponse) => this.storeTokens(auth)),
      switchMap(() => this.fetchProfile(true))
    );
  }

  sendOtp(phoneNumber: string) {
    return this.api.post<{ message: string }>(urlConfig.auth.sendOtp, { phoneNumber }).pipe(
      map((res: ApiResponse<{ message: string }>) => res.data)
    );
  }

  changePassword(data: Record<string, unknown>) {
    const context = new HttpContext().set(showGlobalLoading, true);
    return this.api.post<{ message: string }>(urlConfig.auth.changePassword, data, { context }).pipe(
      map((res: ApiResponse<{ message: string }>) => res.data)
    );
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(this.USER_KEY);
    // Evict all cached route handles so the next user gets fresh component trees
    this.reuseStrategy.evictAll();
  }

  refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);

    return this.api.post<AuthResponse>(urlConfig.auth.refresh, { refreshToken }).pipe(
      map((res: ApiResponse<AuthResponse>) => res.data),
      tap((auth: AuthResponse) => this.storeTokens(auth)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = this.restoreStoredUser();
      if (storedUser) {
        this._user.set(storedUser);
      } else {
        this._user.set({ id: 'loading', email: '' });
      }

      this.fetchProfile().subscribe({
        error: (err) => {
          console.error('[AuthService] checkAuth failed:', err);
          // Only clear state. error.interceptor handles actual 401 logouts.
          this._user.set(null);
        }
      });
    }
  }

  private storeTokens(res: AuthResponse) {
    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
  }

  private fetchProfile(useGlobalLoading = false) {
    const options = useGlobalLoading
      ? { context: new HttpContext().set(showGlobalLoading, true) }
      : undefined;

    return this.api.get<User>(urlConfig.profile.me, options).pipe(
      map((res: ApiResponse<User>) => res.data),
      tap((user: User) => {
        this._user.set(user);
        this.storeUser(user);
      })
    );
  }

  private storeUser(user: User) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage failures.
    }
  }

  private restoreStoredUser(): User | null {
    try {
      const saved = localStorage.getItem(this.USER_KEY);
      if (!saved) return null;
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  }
}

