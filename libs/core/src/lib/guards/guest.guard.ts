import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to prevent authenticated users from accessing guest routes (like login/register).
 * Redirects to dashboard if already logged in.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() || localStorage.getItem('token')) {
    // Already logged in, shouldn't see login page again
    return router.createUrlTree(['/']);
  }

  return true;
};
