import { Route } from '@angular/router';
import { ReelsShellComponent } from './components/reels-shell/reels-shell.component';
import { ReelsComponent } from './components/reels/reels.component';

export const reelsRoutes: Route[] = [
  {
    path: '',
    component: ReelsShellComponent,
    children: [
      { path: '', component: ReelsComponent },
    ],
  },
];
