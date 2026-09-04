import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeShellComponent } from './components/home-shell/home-shell.component';
import { FeedComponent } from '@fe/features/feed';
import { VideoComponent } from '@fe/features/video';
import { ShopComponent } from '@fe/features/shop';
import { StoriesComponent } from '@fe/features/stories';
import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';
import { DiscoverComponent } from './components/discover/discover.component';
import { CreateComponent } from './components/create/create.component';
import { ActivityComponent } from './components/activity/activity.component';
import { FeaturePlaceholderComponent } from './components/feature-placeholder/feature-placeholder.component';
import { RightSidebarComponent } from '@fe/ui';

/**
 * HomeModule
 *
 * Route configuration for the /home subtree.
 *
 * Keep-Alive architecture: HomeShellComponent no longer relies on child
 * router-outlet to render sub-pages. Instead it renders all Keep-Alive
 * tab components directly and shows/hides them via [hidden].
 *
 * The child routes below are kept so that:
 *   1. The browser URL changes correctly when navigating between tabs
 *      (NavigationEnd fires → HomeShellComponent.activeTab updates).
 *   2. Deep-link URLs (/home/discover, /home/chat …) continue to work
 *      on first load / page refresh.
 *
 * All child routes redirect to HomeShellComponent (the empty-path root)
 * because it handles its own content switching internally.
 */
@NgModule({
  imports: [
    CommonModule,
    HomeShellComponent,
    FeedComponent,
    VideoComponent,
    ShopComponent,
    StoriesComponent,
    BottomMenuComponent,
    DiscoverComponent,
    CreateComponent,
    ActivityComponent,
    FeaturePlaceholderComponent,
    RightSidebarComponent,
    RouterModule.forChild([
      {
        path: '',
        component: HomeShellComponent,
        children: [
          // All child paths resolve to HomeShellComponent.
          // The component uses NavigationEnd to sync its activeTab signal,
          // so the URL changes while the shell stays alive.
          { path: ''            , children: [] },   // /home
          { path: 'videos'      , children: [] },   // /home/videos
          { path: 'shop'        , children: [] },   // /home/shop
          { path: 'stories'     , children: [] },   // /home/stories
          { path: 'discover'    , children: [] },   // /home/discover
          { path: 'notifications', children: [] },  // /home/notifications
          { path: 'following'  , children: [] },   // /home/following
          { path: 'chat'       , children: [] },   // /home/chat
          { path: 'reals-ai'   , children: [] },   // /home/reals-ai
          { path: 'bookmarks'  , children: [] },   // /home/bookmarks
          { path: 'premium'    , children: [] },   // /home/premium
          { path: 'more'       , children: [] },   // /home/more
          { path: 'reels'      , redirectTo: '/reels', pathMatch: 'full' },
        ],
      },
    ]),
  ],
})
export class HomeModule {}
