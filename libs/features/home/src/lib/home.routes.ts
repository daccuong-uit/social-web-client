import { Route } from '@angular/router';

export const homeRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./home.module').then((m) => m.HomeModule),
  },
];
