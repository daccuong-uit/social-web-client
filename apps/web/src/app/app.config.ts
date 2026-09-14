import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './routes';
import {
  authInterceptor,
  errorInterceptor,
  loadingInterceptor,
  AppRouteReuseStrategy,
} from '@fe/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    ),
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseStrategy,
    },
  ],
};
