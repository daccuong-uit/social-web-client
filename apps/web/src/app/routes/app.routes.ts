import { Route } from '@angular/router';
import { authGuard } from '@fe/core';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'social' },
  {
    path: 'social',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@fe/features/home').then((m) => m.socialRoutes),
  },
  {
    path: 'feed',
    redirectTo: 'social',
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
  { path: '**', redirectTo: 'social' },
];
