import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { appRoutes } from './routes';
import {
  authInterceptor,
  errorInterceptor,
  loadingInterceptor,
  AppRouteReuseStrategy,
} from '@fe/core';
import { TranslocoHttpLoader } from './transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    ),
    // ─── Keep-Alive: preserve root-level shells between navigations ───────
    // AppRouteReuseStrategy stores detached component trees for routes listed
    // in its KEEP_ALIVE_PATHS set (/home, /profile, /friends …).
    // When the user navigates back Angular reattaches the existing tree
    // instead of recreating it — state and scroll position are preserved.
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseStrategy,
    },
    // ─────────────────────────────────────────────────────────────────────
    provideTransloco({
      config: {
        availableLangs: ['en', 'vi'],
        defaultLang: 'vi',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
