import { Injectable, signal, inject } from '@angular/core';
import {
  ProfileService,
  ProfileResponse,
  ProfileTabDataResponse,
  ProfileFriend,
  ProfileGroup,
  ProfilePost,
  ProfileTab,
} from '@fe/domain/profile';
import { Post, SocialPostService, SocialUserService, UserStatistics } from '@fe/domain/social';
import { take, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileFacade {
  private readonly profileService = inject(ProfileService);
  private readonly socialService = inject(SocialUserService);
  private readonly socialPostService = inject(SocialPostService);

  private readonly _profile = signal<ProfileResponse | null>(null);
  private readonly _stats = signal<UserStatistics | null>(null);
  private readonly _friends = signal<ProfileFriend[]>([]);
  private readonly _tabs = signal<ProfileTab[]>([]);

  private readonly _posts = signal<ProfilePost[]>([]);
  private readonly _groups = signal<ProfileGroup[]>([]);
  private readonly _tabData = signal<ProfileTabDataResponse | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly pendingLikePostIds = new Set<string>();

  readonly profile = this._profile.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly friends = this._friends.asReadonly();
  readonly tabs = this._tabs.asReadonly();

  readonly posts = this._posts.asReadonly();
  readonly groups = this._groups.asReadonly();
  readonly tabData = this._tabData.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadProfile(userId: string) {
    this._isLoading.set(true);
    this._error.set(null);

    const defaultTabs: ProfileTab[] = [
      { id: 'posts', label: 'Bài đăng', count: undefined },
      { id: 'about', label: 'Giới thiệu', count: undefined },
      { id: 'reels', label: 'Reels', count: undefined },
      { id: 'videos', label: 'Videos', count: undefined },
      { id: 'stories', label: 'Stories', count: undefined },
      { id: 'novels', label: 'Truyện', count: undefined },
      { id: 'friends', label: 'Bạn bè', count: undefined },
      { id: 'groups', label: 'Nhóm', count: undefined },
    ];
    this._tabs.set(defaultTabs);

    forkJoin({
      profile: this.profileService.getProfile(userId).pipe(take(1), catchError(() => of(null))),
      stats: this.socialService.getUserStatistics(userId).pipe(take(1), catchError(() => of(null))),
    }).subscribe({
      next: (data) => {
        this._profile.set(data.profile);
        this._stats.set({
          userId,
          postsCount: (data.profile as any)?.postCount ?? data.profile?.stats?.postCount ?? data.stats?.postsCount ?? 0,
          followersCount: (data.profile as any)?.followerCount ?? data.profile?.stats?.followerCount ?? data.stats?.followersCount ?? 0,
          followingCount: (data.profile as any)?.followingCount ?? data.profile?.stats?.followingCount ?? data.stats?.followingCount ?? 0,
          likesReceivedCount: data.stats?.likesReceivedCount ?? 0,
          engagementRate: data.stats?.engagementRate ?? 0,
        });
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Lỗi tải hồ sơ người dùng');
        this._isLoading.set(false);
      },
    });
  }

  private mapProfilePost(rawPost: any, profile: ProfileResponse | null): ProfilePost {
    return this.socialPostService.mapPostForUi(rawPost, {
      fallbackAuthor: profile ? {
        id: profile.userId,
        username: profile.username ?? '',
        fullName: profile.displayName ?? profile.username ?? '',
        avatar: profile.avatarUrl ?? '',
        bio: profile.bio ?? '',
        followers: 0,
        following: 0,
        postsCount: this._stats()?.postsCount ?? 0,
        isFollowing: false,
        isFollowedBy: false,
        isBlocked: false,
        isMuted: false,
      } : undefined,
    }) as ProfilePost;
  }

  togglePostLike(postId: string) {
    const post = this._posts().find((item) => item.id === postId);
    if (!post || this.pendingLikePostIds.has(postId)) {
      return;
    }

    const wasLiked = post.isLiked;
    this.pendingLikePostIds.add(postId);

    const optimistic = this.socialPostService.applyOptimisticLike(this._posts(), postId);
    this._posts.set(optimistic.posts);

    this.socialPostService.toggleLike(postId, wasLiked).pipe(take(1)).subscribe({
      next: (result) => {
        this._posts.update((posts) => this.socialPostService.reconcileLike(posts, postId, result, {
          wasLiked,
          likesCount: optimistic.optimisticLikesCount,
        }, optimistic.optimisticIsLiked));
      },
      error: () => {
        this._posts.update((posts) => this.socialPostService.rollbackLike(posts, postId, {
          wasLiked,
          likesCount: post.likesCount,
        }));
      },
      complete: () => {
        this.pendingLikePostIds.delete(postId);
      },
    });
  }

  loadProfileTabData(userId: string, tabId: string) {
    this.profileService.getProfileTabData(userId, tabId as any).pipe(take(1)).subscribe({
      next: (tabData) => {
        const payload = (tabData as any) ?? {};
        const data = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
        this._tabData.set({ ...(payload ?? {}), data });

        if (tabId === 'posts') {
          const existingPosts = this._posts();
          const posts = Array.isArray(data)
            ? (data as any[]).map((post) => {
              const mappedPost = this.mapProfilePost(post, this._profile()) as ProfilePost;
              const existing = existingPosts.find((item) => item.id === mappedPost.id);
              if (existing) {
                const storedLikeState = this.socialPostService.getLikeState(mappedPost.id);
                return {
                  ...mappedPost,
                  isLiked: storedLikeState?.isLiked ?? existing.isLiked,
                  likesCount: storedLikeState?.likesCount ?? (mappedPost.likesCount || existing.likesCount),
                } as ProfilePost;
              }
              return mappedPost;
            })
            : [];
          this._posts.set(posts as ProfilePost[]);
        } else if (tabId === 'groups') {
          this._groups.set((data as ProfileGroup[]) ?? []);
        } else if (tabId === 'friends') {
          this._friends.set((data as ProfileFriend[]) ?? []);
        }
      },
      error: () => {
        this._tabData.set({ data: [] });
        if (tabId === 'posts') this._posts.set([]);
        if (tabId === 'groups') this._groups.set([]);
        if (tabId === 'friends') this._friends.set([]);
      },
    });
  }
}
