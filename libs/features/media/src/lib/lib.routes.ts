import { Route } from '@angular/router';
import { MediaPlatformComponent } from './media/media-platform.component';
import { MediaStudioComponent } from './media-studio/media-studio.component';

export const mediaRoutes: Route[] = [
  { path: '', component: MediaPlatformComponent },
  { path: 'studio', component: MediaStudioComponent },
];
