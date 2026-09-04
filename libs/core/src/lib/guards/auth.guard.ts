import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const AUTH_REDIRECT_ENABLED = false;

/**
 * Guard to prevent unauthenticated users from accessing protected routes.
 * Temporarily disabled redirect while backend/API is not available.
 *
 * To re-enable later, set AUTH_REDIRECT_ENABLED = true.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // In a real app, this should check the signal or state
  // Since we rely on token existence for now, we check the computed signal or local storage
  if (authService.isAuthenticated() || localStorage.getItem('token')) {
    return true;
  }

  if (!AUTH_REDIRECT_ENABLED) {
    // Temporarily allow access to protected routes during frontend development
    // without a running backend.
    return true;
  }

  // Not logged in, redirect to login
  return router.createUrlTree(['/auth/login']);
};
