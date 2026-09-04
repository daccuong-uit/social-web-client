/**
 * @fileoverview Social service - handles post operations via real API
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Post, CreatePostPayload, UpdatePostPayload, Feed } from '../models';
import { ApiService, appConfig } from '@fe/core';
import { HttpClient } from '@angular/common/http';

export interface LikeablePost {
  id: string;
  isLiked: boolean;
  likesCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class SocialPostService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private readonly apiUrl = appConfig.apiUrl;
  private readonly postLikeStates = new Map<string, { isLiked: boolean; likesCount: number }>();

  setLikeState(postId: string, state: { isLiked: boolean; likesCount: number }) {
    if (!postId) {
      return;
    }

    this.postLikeStates.set(postId, state);
  }

  getLikeState(postId: string) {
    return this.postLikeStates.get(postId);
  }

  /** Map raw backend post to FE Post model */
  mapPostForUi(raw: any, options?: { fallbackAuthor?: Partial<Post['author']> & { id?: string; username?: string; fullName?: string; avatar?: string; bio?: string; followers?: number; following?: number; postsCount?: number; isFollowing?: boolean; isFollowedBy?: boolean; isBlocked?: boolean; isMuted?: boolean } }): Post {
    const author = raw.author ?? {};
    const fallbackAuthor = options?.fallbackAuthor ?? {};
    const serverLikeState = {
      isLiked: Boolean(raw.isLikedByCurrentUser ?? raw.isLiked ?? false),
      likesCount: Number(raw.likeCount ?? raw.likesCount ?? 0),
    };
    const storedLikeState = this.getLikeState(raw.id ?? '');
    const resolvedLikeState = storedLikeState ?? serverLikeState;

    return {
      id: raw.id ?? '',
      author: {
        id: fallbackAuthor.id ?? author.id ?? author.userId ?? '',
        username: fallbackAuthor.username ?? author.username ?? '',
        fullName: fallbackAuthor.fullName ?? author.displayName ?? author.fullName ?? author.username ?? '',
        avatar: fallbackAuthor.avatar ?? author.avatarUrl ?? author.avatar ?? '',
        bio: fallbackAuthor.bio ?? author.bio ?? '',
        followers: fallbackAuthor.followers ?? author.followersCount ?? 0,
        following: fallbackAuthor.following ?? author.followingCount ?? 0,
        postsCount: fallbackAuthor.postsCount ?? author.postCount ?? 0,
        isFollowing: fallbackAuthor.isFollowing ?? author.isFollowing ?? false,
        isFollowedBy: fallbackAuthor.isFollowedBy ?? author.isFollowedBy ?? false,
        isBlocked: fallbackAuthor.isBlocked ?? false,
        isMuted: fallbackAuthor.isMuted ?? false,
      },
      type: raw.type ?? undefined,
      content: raw.content ?? '',
      images: Array.isArray(raw.mediaUrls) ? raw.mediaUrls.filter(Boolean) : [],
      video: undefined,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
      likesCount: resolvedLikeState.likesCount,
      commentsCount: Number(raw.commentCount ?? raw.commentsCount ?? 0),
      sharesCount: Number(raw.shareCount ?? raw.sharesCount ?? 0),
      viewsCount: Number(raw.viewCount ?? raw.viewsCount ?? 0),
      isLiked: resolvedLikeState.isLiked,
      isBookmarked: Boolean(raw.isBookmarkedByCurrentUser ?? raw.isBookmarked ?? false),
      hashtags: Array.isArray(raw.hashtags) ? raw.hashtags : [],
      mentions: Array.isArray(raw.mentions) ? raw.mentions : [],
      privacy: (raw.visibility ?? 'public') as any,
      isPinned: Boolean(raw.isPinned ?? false),
      allowComments: raw.allowComments !== false,
      location: raw.location,
      originalPost: (raw.originalPost && !raw.originalPost.isDeleted) ? this.mapPostForUi(raw.originalPost, options) : undefined,
    };
  }

  applyOptimisticLike<T extends LikeablePost>(posts: T[], postId: string) {
    const post = posts.find((item) => item.id === postId);
    if (!post) {
      return { posts, wasLiked: false, optimisticIsLiked: false, optimisticLikesCount: 0, post: undefined as T | undefined };
    }

    const wasLiked = post.isLiked;
    const optimisticIsLiked = !wasLiked;
    const optimisticLikesCount = Math.max(0, wasLiked ? post.likesCount - 1 : post.likesCount + 1);

    this.setLikeState(postId, { isLiked: optimisticIsLiked, likesCount: optimisticLikesCount });

    const updatedPosts = posts.map((item) => item.id === postId
      ? { ...item, isLiked: optimisticIsLiked, likesCount: optimisticLikesCount }
      : item);

    return { posts: updatedPosts, wasLiked, optimisticIsLiked, optimisticLikesCount, post };
  }

  reconcileLike<T extends LikeablePost>(
    posts: T[],
    postId: string,
    result: { likeCount?: number; isLikedByCurrentUser?: boolean },
    previousState: { wasLiked: boolean; likesCount: number },
    optimisticIsLiked?: boolean,
  ) {
    const nextIsLiked = optimisticIsLiked ?? result.isLikedByCurrentUser ?? previousState.wasLiked;
    const nextLikesCount = Math.max(0, result.likeCount ?? previousState.likesCount);

    this.setLikeState(postId, { isLiked: nextIsLiked, likesCount: nextLikesCount });

    return posts.map((item) => item.id === postId
      ? {
        ...item,
        isLiked: nextIsLiked,
        likesCount: nextLikesCount,
      }
      : item);
  }

  rollbackLike<T extends LikeablePost>(
    posts: T[],
    postId: string,
    previousState: { wasLiked: boolean; likesCount: number },
  ) {
    this.setLikeState(postId, { isLiked: previousState.wasLiked, likesCount: previousState.likesCount });

    return posts.map((item) => item.id === postId
      ? {
        ...item,
        isLiked: previousState.wasLiked,
        likesCount: previousState.likesCount,
      }
      : item);
  }

  /**
   * Get feed posts (personal feed or discover)
   */
  getFeed(type: 'personal' | 'discover' = 'personal', page = 1): Observable<Feed> {
    const endpoint = type === 'personal' ? '/feed' : '/discover';
    return this.api.get<any[]>(endpoint, { params: { page, pageSize: 20 } }).pipe(
      map(res => {
        const rawPosts: any[] = Array.isArray(res.data) ? res.data : [];
        const pagination = res.meta?.pagination ?? {};
        return {
          posts: rawPosts.map(p => this.mapPostForUi(p)),
          hasMore: pagination.hasNext ?? false,
          nextCursor: pagination.currentPage ? String(pagination.currentPage + 1) : undefined,
        };
      }),
      catchError(err => {
        console.error('[SocialPostService] getFeed error:', err);
        return of({ posts: [], hasMore: false });
      })
    );
  }

  /**
   * Get a single post by ID
   */
  getPost(postId: string): Observable<Post | null> {
    return this.api.get<any>(`/posts/${postId}`).pipe(
      map(res => this.mapPostForUi(res.data)),
      catchError(() => of(null))
    );
  }

  /**
   * Create a new post - upload media first, then create post
   */
  createPost(payload: CreatePostPayload): Observable<Post> {
    const uploadTasks: Observable<string>[] = [];

    if (payload.images && payload.images.length > 0) {
      for (const file of payload.images) {
        const upload$ = this.http
          .post<{ mediaId: string; uploadUrl: string }>(
            `${this.apiUrl}/media/presigned-upload`,
            {
              originalName: file.name,
              mimeType: file.type,
              fileSize: file.size,
            }
          )
          .pipe(
            switchMap((presigned) => {
              // Extract just the data if it's wrapped in { data: ... }
              const data = (presigned as any).data || presigned;
              return this.http
                .put(data.uploadUrl, file)
                .pipe(
                  switchMap(() =>
                    this.http.post<{ data?: { id: string }; id?: string }>(
                      `${this.apiUrl}/media/${data.mediaId}/complete`,
                      {}
                    )
                  ),
                  map((res) => {
                    return res?.data?.id || res?.id || data.mediaId;
                  })
                );
            })
          );
        uploadTasks.push(upload$);
      }
    }

    const buildDto = (mediaIds: string[] = []) => ({
      content: payload.content,
      type: mediaIds.length > 1 ? 'gallery' : mediaIds.length === 1 ? 'image' : 'text',
      mediaIds,
      hashtags: payload.hashtags,
      visibility: payload.privacy ?? 'public',
      location: payload.location,
      originalPostId: payload.originalPostId,
    });

    if (uploadTasks.length > 0) {
      return forkJoin(uploadTasks).pipe(
        switchMap(mediaIds =>
          this.api.post<any>('/posts', buildDto(mediaIds))
        ),
        map(res => this.mapPostForUi(res.data))
      );
    }

    return this.api.post<any>('/posts', buildDto()).pipe(
      map(res => this.mapPostForUi(res.data))
    );
  }

  /**
   * Update a post
   */
  updatePost(postId: string, payload: UpdatePostPayload): Observable<Post> {
    return this.api.put<any>(`/posts/${postId}`, payload).pipe(
      map(res => this.mapPostForUi(res.data))
    );
  }

  /**
   * Delete a post
   */
  deletePost(postId: string): Observable<void> {
    return this.api.delete<void>(`/posts/${postId}`).pipe(
      map(() => undefined)
    );
  }

  /**
   * Like / Unlike a post and return server state
   */
  toggleLike(postId: string, currentlyLiked = false): Observable<{ likeCount: number; isLikedByCurrentUser: boolean }> {
    if (currentlyLiked) {
      return this.api.delete<any>(`/posts/${postId}/like`).pipe(
        map(res => ({ likeCount: res.data.likeCount ?? 0, isLikedByCurrentUser: res.data.isLikedByCurrentUser ?? false })),
        catchError(() => of({ likeCount: 0, isLikedByCurrentUser: false }))
      );
    }
    return this.api.post<any>(`/posts/${postId}/like`).pipe(
      map(res => ({ likeCount: res.data.likeCount ?? 0, isLikedByCurrentUser: res.data.isLikedByCurrentUser ?? true })),
      catchError(() => of({ likeCount: 0, isLikedByCurrentUser: true }))
    );
  }

  /**
   * Share a post
   */
  sharePost(postId: string): Observable<void> {
    return this.api.post<void>(`/posts/${postId}/share`).pipe(
      map(() => undefined)
    );
  }

  /**
   * Get posts by hashtag
   */
  getPostsByHashtag(hashtag: string): Observable<Post[]> {
    return this.api.get<any[]>(`/posts`, { params: { hashtag } }).pipe(
      map(res => (Array.isArray(res.data) ? res.data : []).map((p: any) => this.mapPostForUi(p)))
    );
  }

  /**
   * Get user's posts
   */
  getUserPosts(userId: string): Observable<Post[]> {
    return this.api.get<any[]>(`/posts`, { params: { authorId: userId } }).pipe(
      map(res => (Array.isArray(res.data) ? res.data : []).map((p: any) => this.mapPostForUi(p)))
    );
  }
}
