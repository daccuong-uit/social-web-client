import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthClient, UserSessionStore } from '@daccuong-uit/frontend-core';
import { EMPTY, Observable, of } from 'rxjs';
import { AppRouteReuseStrategy } from './route-reuse.strategy';

export interface User {
  id: string;
  userId?: string;
  email: string;
  username?: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authClient = inject(AuthClient);
  private readonly sessionStore = inject(UserSessionStore);
  private readonly reuseStrategy = inject(AppRouteReuseStrategy);
  private readonly userState = signal<User | null>(null);

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => {
    const currentUser = this.userState();
    return Boolean(currentUser && currentUser.id !== 'loading');
  });

  login(_credentials?: Record<string, unknown>): Observable<never> {
    return this.startLogin();
  }

  register(_data?: Record<string, unknown>): Observable<never> {
    return this.startLogin();
  }

  sendOtp(_phoneNumber: string): Observable<never> {
    return this.startLogin();
  }

  changePassword(_data: Record<string, unknown>): Observable<never> {
    return this.startLogin();
  }

  logout(): void {
    this.userState.set(null);
    this.sessionStore.clear();
    this.reuseStrategy.evictAll();
    void this.authClient.logout();
  }

  refresh(): Observable<null> {
    return of(null);
  }

  checkAuth(): void {
    this.clearLegacyCredentials();
    this.userState.set({ id: 'loading', email: '' });
    void this.authClient.getSession().then((session) => {
      const user = session.user;
      this.userState.set(user ? {
        id: user.sub,
        userId: user.sub,
        email: user.email ?? '',
        username: user.username,
        displayName: user.name,
      } : null);
    }).catch(() => this.userState.set(null));
  }

  private startLogin(): Observable<never> {
    this.authClient.login();
    return EMPTY;
  }

  private clearLegacyCredentials(): void {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch {
      return;
    }
  }
}

