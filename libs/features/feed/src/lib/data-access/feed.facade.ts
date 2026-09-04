import { Injectable, signal, inject } from '@angular/core';
import { SocialPostService, Post, CreatePostPayload } from '@fe/domain/social';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedFacade {
  private readonly postService = inject(SocialPostService);

  private readonly _posts = signal<Post[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly pendingLikePostIds = new Set<string>();

  readonly posts = this._posts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadFeed() {
    this._isLoading.set(true);
    this._error.set(null);
    this.postService.getFeed('personal').pipe(take(1)).subscribe({
      next: (feed) => {
        this._posts.set(feed.posts);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Lỗi tải trang');
        this._isLoading.set(false);
      }
    });
  }

  toggleLike(postId: string) {
    const post = this._posts().find(p => p.id === postId);
    if (!post || this.pendingLikePostIds.has(postId)) {
      return;
    }

    const wasLiked = post.isLiked;
    this.pendingLikePostIds.add(postId);

    const optimistic = this.postService.applyOptimisticLike(this._posts(), postId);
    this._posts.set(optimistic.posts);

    this.postService.toggleLike(postId, wasLiked).pipe(take(1)).subscribe({
      next: (result) => {
        this._posts.update(posts => this.postService.reconcileLike(posts, postId, result, {
          wasLiked,
          likesCount: optimistic.optimisticLikesCount,
        }, optimistic.optimisticIsLiked));
      },
      error: () => {
        this._posts.update(posts => this.postService.rollbackLike(posts, postId, {
          wasLiked,
          likesCount: post.likesCount,
        }));
      },
      complete: () => {
        this.pendingLikePostIds.delete(postId);
      },
    });
  }

  createPost(payload: CreatePostPayload) {
    if (payload.originalPostId) {
      this._posts.update(posts => posts.map(p => {
        if (p.id === payload.originalPostId) {
          return { ...p, sharesCount: (p.sharesCount || 0) + 1 } as Post;
        }
        if (p.originalPost && p.originalPost.id === payload.originalPostId) {
          return { 
            ...p, 
            originalPost: { 
              ...p.originalPost, 
              sharesCount: (p.originalPost.sharesCount || 0) + 1 
            } as Post
          } as Post;
        }
        return p;
      }));
    }

    this.postService.createPost(payload).pipe(take(1)).subscribe({
      next: (newPost) => {
        // Optimistic: prepend new post to list
        this._posts.update(posts => [newPost, ...posts]);
      },
      error: (err) => {
        this._error.set(err.message || 'Lỗi đăng bài');
      }
    });
  }
}
