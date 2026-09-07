import { Injectable, signal, inject } from '@angular/core';
import { SocialUserService } from '../services/social-user.service';
import { User } from '../models/social.models';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocialFacade {
  private readonly userService = inject(SocialUserService);

  // Global state for social interactions
  private readonly _suggestedUsers = signal<User[]>([]);
  private readonly _friends = signal<User[]>([]);
  private readonly _isLoading = signal<boolean>(false);

  readonly suggestedUsers = this._suggestedUsers.asReadonly();
  readonly friends = this._friends.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  loadSuggestedUsers() {
    this._isLoading.set(true);
    this.userService.getSuggestedUsers().pipe(take(1)).subscribe({
      next: (users) => {
        this._suggestedUsers.set(users);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }

  loadFriends(userId: string) {
    this._isLoading.set(true);
    // Assuming friends are represented by followers in this service
    this.userService.getFollowers(userId).pipe(take(1)).subscribe({
      next: (users) => {
        this._friends.set(users);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }

  toggleFollow(user: User) {
    const isCurrentlyFollowing = user.isFollowing;
    const userId = user.id;

    // Optimistic Update
    this.updateUserFollowState(userId, !isCurrentlyFollowing);

    const action$ = isCurrentlyFollowing 
      ? this.userService.unfollowUser(userId) 
      : this.userService.followUser(userId);

    action$.pipe(take(1)).subscribe({
      next: () => {},
      error: () => {
        // Rollback on error
        this.updateUserFollowState(userId, isCurrentlyFollowing);
      }
    });
  }

  private updateUserFollowState(userId: string, isFollowing: boolean) {
    // Update in suggested users
    this._suggestedUsers.update(users => users.map(u => {
      if (u.id === userId) {
        return { ...u, isFollowing };
      }
      return u;
    }));

    // Update in friends
    this._friends.update(users => users.map(u => {
      if (u.id === userId) {
        return { ...u, isFollowing };
      }
      return u;
    }));
  }
}
