import { Route } from '@angular/router';
import { FriendsComponent } from './friends/friends';
import { FriendRequestsComponent } from './pages/requests/requests.component';
import { FriendSuggestionsComponent } from './pages/suggestions/suggestions.component';
import { FriendSentComponent } from './pages/sent/sent.component';
import { FriendFollowingComponent } from './pages/following/following.component';
import { FriendFollowersComponent } from './pages/followers/followers.component';
import { FriendAllComponent } from './pages/all/all.component';
import { FriendRelationshipsComponent } from './pages/relationships/relationships.component';
import { FriendBlockedComponent } from './pages/blocked/blocked.component';
import { FriendMutedComponent } from './pages/muted/muted.component';

export const friendsRoutes: Route[] = [
  {
    path: '',
    component: FriendsComponent,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      { path: 'all', component: FriendAllComponent },
      { path: 'requests', component: FriendRequestsComponent },
      { path: 'suggestions', component: FriendSuggestionsComponent },
      { path: 'sent', component: FriendSentComponent },
      { path: 'following', component: FriendFollowingComponent },
      { path: 'followers', component: FriendFollowersComponent },
      { path: 'relationships', component: FriendRelationshipsComponent },
      { path: 'blocked', component: FriendBlockedComponent },
      { path: 'muted', component: FriendMutedComponent },
    ]
  }
];
