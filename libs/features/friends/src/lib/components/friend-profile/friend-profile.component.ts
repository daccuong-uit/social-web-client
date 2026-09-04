import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButton } from '@fe/ui';
import { PostCardComponent } from '@fe/ui';
import { RelativeTimePipe } from '@fe/core';
import { ProfileService } from '@fe/domain/profile';
import { Post, SocialPostService } from '@fe/domain/social';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
// No explicit Friend type exported; using any

@Component({
  selector: 'feat-friend-profile',
  standalone: true,
  imports: [CommonModule, UiButton, PostCardComponent, RelativeTimePipe],
  templateUrl: './friend-profile.component.html',
  styleUrls: ['./friend-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FriendProfileComponent implements OnChanges {
  @Input() friend?: any;

  private readonly profileService = inject(ProfileService);
  private readonly socialPostService = inject(SocialPostService);

  posts = signal<Post[]>([]);
  isLoadingPosts = signal(false);
  postCountDisplay = computed(() => this.isLoadingPosts() ? (this.friend?.postCount ?? 0) : this.posts().length);
  private readonly pendingLikePostIds = new Set<string>();

  mockReels = [
    { id: 1, title: 'Bí kíp quay video triệu view', views: '1.2M', cover: 'https://picsum.photos/300/500?random=41' },
    { id: 2, title: 'Cách edit video siêu nhanh', views: '850K', cover: 'https://picsum.photos/300/500?random=42' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['friend'] && this.friend?.id) {
      this.loadPosts(this.friend.id);
    }
  }

  private resolveFriendUserId(): string | null {
    return this.friend?.userId ?? this.friend?.id ?? null;
  }

  private mapPost(rawPost: any): Post {
    return this.socialPostService.mapPostForUi(rawPost, {
      fallbackAuthor: this.friend ? {
        id: this.friend.userId ?? this.friend.id ?? '',
        username: this.friend.username ?? '',
        fullName: this.friend.displayName || this.friend.name || this.friend.username || '',
        avatar: this.friend.avatarUrl ?? '',
        bio: this.friend.bio ?? '',
        followers: this.friend.followerCount ?? 0,
        following: this.friend.followingCount ?? 0,
        postsCount: this.friend.postCount ?? 0,
        isFollowing: false,
        isFollowedBy: false,
        isBlocked: false,
        isMuted: false,
      } : undefined,
    });
  }

  toggleLike(postId: string): void {
    const post = this.posts().find((item) => item.id === postId);
    if (!post || this.pendingLikePostIds.has(postId)) {
      return;
    }

    const wasLiked = post.isLiked;
    this.pendingLikePostIds.add(postId);

    const optimistic = this.socialPostService.applyOptimisticLike(this.posts(), postId);
    this.posts.set(optimistic.posts);

    this.socialPostService.toggleLike(postId, wasLiked).pipe(take(1)).subscribe({
      next: (result) => {
        this.posts.update((items) => this.socialPostService.reconcileLike(items, postId, result, {
          wasLiked,
          likesCount: optimistic.optimisticLikesCount,
        }, optimistic.optimisticIsLiked));
      },
      error: () => {
        this.posts.update((items) => this.socialPostService.rollbackLike(items, postId, {
          wasLiked,
          likesCount: post.likesCount,
        }));
      },
      complete: () => {
        this.pendingLikePostIds.delete(postId);
      },
    });
  }

  private loadPosts(userId: string): void {
    const resolvedUserId = userId || this.resolveFriendUserId();
    if (!resolvedUserId) {
      this.posts.set([]);
      this.isLoadingPosts.set(false);
      return;
    }

    this.isLoadingPosts.set(true);
    this.profileService.getProfileTabData(resolvedUserId, 'posts', 1, 10)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe(res => {
        const posts = Array.isArray(res)
          ? (res as any[]).map((post) => this.mapPost(post))
          : [];
        this.posts.set(posts);
        this.isLoadingPosts.set(false);
      });
  }

  avatarUrl() {
    const name = this.friend?.displayName || this.friend?.name || this.friend?.username || 'User';
    return this.friend?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=333&color=fff`;
  }

  coverUrl() {
    return this.friend?.coverUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18';
  }

  profileHandle() {
    const username = this.friend?.username;
    return username ? `@${username}` : '@nguoi_dung';
  }
}
