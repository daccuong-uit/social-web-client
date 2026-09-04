/**
 * @fileoverview User service - handles user operations
 * PHASE 5: Uses mock data. Replace with actual API service in Phase 5B.
 */

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserStatistics } from '../models';
import { MOCK_USERS, MOCK_SUGGESTED_USERS, MOCK_POSTS } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root',
})
export class SocialUserService {
  private users = { ...MOCK_USERS };

  /**
   * Get current user
   */
  getCurrentUser(): Observable<User> {
    return of(this.users.current_user).pipe(delay(300));
  }

  /**
   * Get a user by ID or username
   */
  getUser(identifier: string): Observable<User | null> {
    const user = Object.values(this.users).find(
      (u) => u.id === identifier || u.username === identifier
    );
    return of(user || null).pipe(delay(300));
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, updates: Partial<User>): Observable<User> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    const updated = { ...user, ...updates };
    const key = Object.entries(this.users).find(([, u]) => u.id === userId)?.[0];
    if (key) {
      this.users[key as keyof typeof this.users] = updated;
    }

    return of(updated).pipe(delay(600));
  }

  /**
   * Follow a user
   */
  followUser(userId: string): Observable<void> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    user.isFollowing = true;
    user.followers += 1;

    const currentUser = this.users.current_user;
    currentUser.following += 1;

    return of(undefined).pipe(delay(500));
  }

  /**
   * Unfollow a user
   */
  unfollowUser(userId: string): Observable<void> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    user.isFollowing = false;
    user.followers = Math.max(0, user.followers - 1);

    const currentUser = this.users.current_user;
    currentUser.following = Math.max(0, currentUser.following - 1);

    return of(undefined).pipe(delay(500));
  }

  /**
   * Block a user
   */
  blockUser(userId: string): Observable<void> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    user.isBlocked = true;
    if (user.isFollowing) {
      this.unfollowUser(userId).subscribe();
    }

    return of(undefined).pipe(delay(500));
  }

  /**
   * Unblock a user
   */
  unblockUser(userId: string): Observable<void> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    user.isBlocked = false;
    return of(undefined).pipe(delay(400));
  }

  /**
   * Mute a user
   */
  muteUser(userId: string): Observable<void> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    user.isMuted = true;
    return of(undefined).pipe(delay(300));
  }

  /**
   * Unmute a user
   */
  unmuteUser(userId: string): Observable<void> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    user.isMuted = false;
    return of(undefined).pipe(delay(300));
  }

  /**
   * Get user's followers
   */
  getFollowers(userId: string): Observable<User[]> {
    // Mock: return random users as followers
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    const followers = Object.values(this.users)
      .filter((u) => u.id !== userId && u.isFollowedBy)
      .slice(0, 5);

    return of(followers).pipe(delay(400));
  }

  /**
   * Get user's following
   */
  getFollowing(userId: string): Observable<User[]> {
    // Mock: return random users as following
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    const following = Object.values(this.users)
      .filter((u) => u.id !== userId && u.isFollowing)
      .slice(0, 5);

    return of(following).pipe(delay(400));
  }

  /**
   * Get user statistics
   */
  getUserStatistics(userId: string): Observable<UserStatistics> {
    const user = Object.values(this.users).find((u) => u.id === userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    const userPosts = MOCK_POSTS.filter((p) => p.author.id === userId);
    const totalLikes = userPosts.reduce((sum, p) => sum + p.likesCount, 0);
    const totalEngagement = userPosts.reduce(
      (sum, p) => sum + p.likesCount + p.commentsCount + p.sharesCount,
      0
    );

    const stats: UserStatistics = {
      userId,
      postsCount: user.postsCount,
      followersCount: user.followers,
      followingCount: user.following,
      likesReceivedCount: totalLikes,
      engagementRate:
        userPosts.length > 0
          ? Math.round((totalEngagement / (userPosts.length * 100)) * 100) / 100
          : 0,
    };

    return of(stats).pipe(delay(500));
  }

  /**
   * Get suggested users to follow
   */
  getSuggestedUsers(): Observable<User[]> {
    return of(MOCK_SUGGESTED_USERS).pipe(delay(600));
  }

  /**
   * Search users
   */
  searchUsers(query: string): Observable<User[]> {
    const results = Object.values(this.users)
      .filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.fullName.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10);

    return of(results).pipe(delay(500));
  }
}
