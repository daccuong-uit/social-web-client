import { Route } from '@angular/router';
import { authGuard } from '@fe/core';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'auth',
    loadChildren: () => import('@fe/features/auth').then((m) => m.authRoutes),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@fe/features/home').then((m) => m.homeRoutes),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@fe/features/profile').then((m) => m.profileRoutes),
  },
  {
    path: 'friends',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@fe/features/friends').then((m) => m.friendsRoutes),
  },
  {
    path: 'reels',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@fe/features/reels').then((m) => m.reelsRoutes),
  },
  {
    path: 'media',
    canActivate: [authGuard],
    loadChildren: () => import('@fe/features/media').then((m) => m.mediaRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@fe/features/dashboard').then((m) => m.dashboardRoutes),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@fe/features/settings').then((m) => m.settingsRoutes),
  },
  { path: 'login', redirectTo: 'auth/login' },
  { path: 'register', redirectTo: 'auth/register' },
  { path: '**', redirectTo: 'home' },
];

