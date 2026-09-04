/**
 * @fileoverview Search service - handles search operations
 * PHASE 5: Uses mock data. Replace with actual API service in Phase 5B.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SearchResults, User, Post, Hashtag } from '../models';
import { MOCK_SEARCH_RESULTS, MOCK_HASHTAGS, MOCK_POSTS } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root',
})
export class SocialSearchService {
  /**
   * Search all content (users, posts, hashtags)
   */
  search(query: string): Observable<SearchResults> {
    const results: SearchResults = {
      users: this.searchUsers(query),
      posts: this.searchPosts(query),
      hashtags: this.searchHashtags(query),
    };
    return of(results).pipe(delay(600));
  }

  /**
   * Search users
   */
  searchUsers(query: string): User[] {
    if (!query) {
      return [];
    }

    return MOCK_SEARCH_RESULTS.users.filter(
      (u) =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.fullName.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Search posts by content or hashtags
   */
  searchPosts(query: string): Post[] {
    if (!query) {
      return [];
    }

    return MOCK_SEARCH_RESULTS.posts.filter(
      (p) =>
        p.content.toLowerCase().includes(query.toLowerCase()) ||
        p.hashtags.some((h) => h.toLowerCase().includes(query.toLowerCase())) ||
        p.author.username.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Search hashtags
   */
  searchHashtags(query: string): Hashtag[] {
    if (!query) {
      return [];
    }

    return MOCK_HASHTAGS.filter((h) =>
      h.tag.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get search suggestions
   */
  getSearchSuggestions(query: string): Observable<SearchResults> {
    return this.search(query).pipe(delay(300));
  }

  /**
   * Get trending searches
   */
  getTrendingSearches(): Observable<string[]> {
    const trending = ['angular', 'development', 'design', 'web', 'socialmedia'];
    return of(trending).pipe(delay(400));
  }

  /**
   * Get posts by hashtag
   */
  getPostsByHashtag(hashtag: string): Observable<Post[]> {
    const posts = MOCK_POSTS.filter((p) =>
      p.hashtags.some((h) => h.toLowerCase() === hashtag.toLowerCase())
    );
    return of(posts).pipe(delay(500));
  }

  /**
   * Get hashtag details
   */
  getHashtagDetails(hashtag: string): Observable<Hashtag | null> {
    const details = MOCK_HASHTAGS.find(
      (h) => h.tag.toLowerCase() === hashtag.toLowerCase()
    );
    return of(details || null).pipe(delay(300));
  }
}
