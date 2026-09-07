import { Route } from '@angular/router';
import { HomeShellComponent } from './components/home-shell/home-shell.component';

export const homeRoutes: Route[] = [
  {
    path: '',
    component: HomeShellComponent,
    children: [
      { path: '', children: [] },
      { path: 'videos', children: [] },
      { path: 'shop', children: [] },
      { path: 'stories', children: [] },
      { path: 'discover', children: [] },
      { path: 'notifications', children: [] },
      { path: 'following', children: [] },
      { path: 'chat', children: [] },
      { path: 'reals-ai', children: [] },
      { path: 'bookmarks', children: [] },
      { path: 'premium', children: [] },
      { path: 'more', children: [] },
      { path: 'reels', redirectTo: '/reels', pathMatch: 'full' },
    ],
  },
];
