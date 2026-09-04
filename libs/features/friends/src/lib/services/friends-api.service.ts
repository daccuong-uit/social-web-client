import { Injectable, inject } from '@angular/core';
import { ApiService } from '@fe/core';
import { Observable, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface MenuItemConfig {
  id: string;
  label: string;
  icon?: string;
  isDanger?: boolean;
  hasSubmenu?: boolean;
  submenuItems?: MenuItemConfig[];
}

export interface FriendUser {
  id: string;
  name: string;
  avatar: string | null;
  username?: string;
  mutualFriends?: number;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  privatePostCount?: number;
  relationshipDate?: string;
  status?: string;
  relationshipType?: string;
  subtitle?: string;
  menuItems?: MenuItemConfig[];
  bio?: string;
  website?: string;
  location?: string;
  hometown?: string;
  birthday?: string;
  gender?: string;
  relationshipStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsApiService {
  private readonly apiService = inject(ApiService);

  private buildPaginationParams(page: number, pageSize: number): HttpParams {
    return new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  }

  getFriends(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/friendship/friends', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  getIncomingRequests(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/friendship/requests/received', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  getSentRequests(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/friendship/requests/sent', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  getSuggestions(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/friendship/suggestions', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  getRelationships(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/friendship/relationships', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  getFollowing(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/follow/following', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  getFollowers(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/follow/followers', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  getBlockedUsers(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/users/blocked', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  getMutedUsers(page = 1, pageSize = 20): Observable<FriendUser[]> {
    return this.apiService.get<FriendUser[]>('/users/muted', {
      params: this.buildPaginationParams(page, pageSize)
    }).pipe(
      map(res => res.data)
    );
  }

  sendFriendRequest(userId: string): Observable<unknown> {
    return this.apiService.post('/friendship/requests', { targetUserId: userId });
  }

  cancelFriendRequest(userId: string): Observable<unknown> {
    return this.apiService.delete(`/friendship/requests/${userId}`);
  }

  acceptFriendRequest(userId: string): Observable<unknown> {
    return this.apiService.post(`/friendship/requests/${userId}/accept`);
  }

  rejectFriendRequest(userId: string): Observable<unknown> {
    return this.apiService.post(`/friendship/requests/${userId}/decline`);
  }

  unfriend(userId: string): Observable<unknown> {
    return this.apiService.delete(`/friendship/friends/${userId}`);
  }

  updateRelationship(userId: string, type: string): Observable<unknown> {
    return this.apiService.put(`/friendship/${userId}/relationship`, { type });
  }

  followUser(userId: string): Observable<unknown> {
    return this.apiService.post('/follow', { targetUserId: userId });
  }

  unfollowUser(userId: string): Observable<unknown> {
    return this.apiService.post('/follow/unfollow', { targetUserId: userId });
  }

  removeFollower(userId: string): Observable<unknown> {
    return this.apiService.delete(`/follow/followers/${userId}`);
  }

  blockUser(userId: string): Observable<unknown> {
    return this.apiService.post(`/users/${userId}/block`);
  }

  unblockUser(userId: string): Observable<unknown> {
    return this.apiService.delete(`/users/${userId}/block`);
  }

  muteUser(userId: string): Observable<unknown> {
    return this.apiService.post(`/users/${userId}/mute`);
  }

  unmuteUser(userId: string): Observable<unknown> {
    return this.apiService.delete(`/users/${userId}/mute`);
  }
}
