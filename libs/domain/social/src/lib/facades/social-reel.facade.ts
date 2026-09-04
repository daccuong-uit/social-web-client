import { Injectable, signal, computed, inject } from '@angular/core';
import { SocialReelService } from '../services/social-reel.service';
import { SocialCommentService } from '../services/social-comment.service';
import { ReelItem, ReelComment, CreateReelPayload } from '../models/social-reel.models';
import { Comment, CreateCommentPayload } from '../models';
import { catchError, tap, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { insertCommentIntoTree, replaceOptimisticComment } from '../utils/comment-tree';

@Injectable({ providedIn: 'root' })
export class SocialReelFacade {
  private reelService = inject(SocialReelService);
  private commentService = inject(SocialCommentService);

  reels = signal<ReelItem[]>([]);
  friendReels = signal<ReelItem[]>([]);
  isFriendReelsLoading = signal(false);
  currentIndex = signal(0);
  showComments = signal(false);
  newComment = signal('');
  isFollowing = signal<Record<string, boolean>>({});

  /** Standard Comment[] for the full-featured comment panel in the sidebar */
  reelComments = signal<Comment[]>([]);
  isReelCommentsLoading = signal(false);

  currentReel = computed(() => this.reels()[this.currentIndex()]);

  constructor() {
    // Explicit API calls have been moved to component lifecycle hooks
    // to prevent fetching unnecessary data on app load.
  }

  loadReels() {
    this.reelService.getDiscoverReels().pipe(take(1)).subscribe({
      next: (response) => {
        const items = response.data.map((r: any) => ({
          id: r.id,
          author: r.author?.displayName || r.author?.username || 'Unknown',
          avatar: r.author?.avatarUrl || '',
          description: r.content,
          music: '♪ Trending',
          likes: r.likeCount,
          comments: r.commentCount,
          shares: r.shareCount,
          saves: 0,
          liked: r.isLikedByCurrentUser,
          saved: r.isBookmarkedByCurrentUser,
          fallbackUrl: r.fallbackUrl,
          videoUrl: r.videoUrl,
          thumbnailUrl: r.thumbnailUrl || r.coverUrl,
          userId: r.author?.id,
          thumbnailColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          commentList: []
        }));
        this.reels.set(items);
      },
      error: (err) => {
        console.error('Error loading reels', err);
      }
    });
  }

  loadFriendReels() {
    this.isFriendReelsLoading.set(true);
    this.reelService.getFriendReels().pipe(take(1)).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : (response?.data ?? []);
        const items: ReelItem[] = data.map((r: any) => ({
          id: r.id,
          author: r.author?.displayName || r.author?.username || 'Unknown',
          avatar: r.author?.avatarUrl || '',
          description: r.content || r.description || '',
          music: r.music || '♪ Trending',
          likes: r.likeCount ?? 0,
          comments: r.commentCount ?? 0,
          shares: r.shareCount ?? 0,
          saves: 0,
          liked: r.isLikedByCurrentUser ?? false,
          saved: r.isBookmarkedByCurrentUser ?? false,
          videoUrl: r.videoUrl || '',
          thumbnailUrl: r.thumbnailUrl || r.coverUrl,
          userId: r.author?.id,
          thumbnailColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          commentList: []
        }));
        this.friendReels.set(items);
        this.isFriendReelsLoading.set(false);
      },
      error: () => {
        // Nếu API chưa có, fallback về mảng rỗng
        this.friendReels.set([]);
        this.isFriendReelsLoading.set(false);
      }
    });
  }

  createReel(payload: CreateReelPayload) {
    return this.reelService.createReel(payload);
  }

  /**
   * Load comments for a reel using the flat ReelComment model.
   * @deprecated Use loadReelCommentsV2() for full-featured comment panel.
   */
  loadCommentsForReel(reelId: string) {
    this.reelService.getReelComments(reelId).pipe(take(1)).subscribe({
      next: (response) => {
        const comments = response.data.map((c: any) => ({
          id: c.id,
          author: c.author?.displayName || c.author?.username || 'Unknown',
          avatar: c.author?.avatarUrl || '',
          text: c.content,
          timeAgo: new Date(c.createdAt).toLocaleDateString(),
          likes: c.likeCount,
          liked: c.isLikedByCurrentUser
        }));

        this.reels.update((list) =>
          list.map((r) => r.id === reelId ? { ...r, commentList: comments } : r)
        );
      },
      error: (err) => {
        console.error('Error loading comments', err);
      }
    });
  }

  /**
   * Load comments for a reel into the standard Comment[] signal.
   * Used by the full-featured comment panel in the sidebar.
   */
  loadReelCommentsV2(reelId: string) {
    this.isReelCommentsLoading.set(true);
    this.reelService.getReelCommentsAsComments(reelId).pipe(take(1)).subscribe({
      next: (comments) => {
        this.reelComments.set(comments);
        this.isReelCommentsLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading reel comments', err);
        this.reelComments.set([]);
        this.isReelCommentsLoading.set(false);
      }
    });
  }

  /**
   * Submit a comment (or reply) on the current reel with full payload support.
   * Performs optimistic insert and replaces with server response.
   */
  submitReelCommentFull(
    reelId: string,
    payload: CreateCommentPayload,
    optimisticComment: Comment
  ) {
    // Optimistic insert at top or into reply tree
    if (payload.replyToCommentId) {
      this.reelComments.update((list) =>
        insertCommentIntoTree(list, optimisticComment, payload.replyToCommentId!)
      );
    } else {
      this.reelComments.update((list) => [optimisticComment, ...list]);
    }

    this.reelService.submitReelComment(reelId, payload).pipe(take(1)).subscribe({
      next: (serverComment) => {
        // Replace optimistic comment with the server version
        this.reelComments.update((list) =>
          replaceOptimisticComment(list, optimisticComment.id, serverComment)
        );
        // Update comment count on the reel
        this.reels.update((list) =>
          list.map((r) =>
            r.id === reelId ? { ...r, comments: r.comments + 1 } : r
          )
        );
      },
      error: (err) => {
        console.error('Error submitting reel comment', err);
        // Roll back optimistic insert
        this.reelComments.update((list) =>
          list.filter((c) => c.id !== optimisticComment.id)
        );
      }
    });
  }

  /**
   * Toggle like on a comment using the shared SocialCommentService.
   * Performs optimistic update with rollback on error.
   */
  toggleReelCommentLike(commentId: string) {
    const comment = this.findCommentInReelComments(commentId);
    if (!comment) return;

    const wasLiked = Boolean(comment.isLiked);
    const optimisticCount = Math.max(0, comment.likesCount + (wasLiked ? -1 : 1));

    // Optimistic update
    this.reelComments.update((list) =>
      this.updateCommentInTree(list, commentId, { isLiked: !wasLiked, likesCount: optimisticCount })
    );

    this.commentService.toggleCommentLike(commentId, wasLiked).pipe(take(1)).subscribe({
      next: (result) => {
        this.reelComments.update((list) =>
          this.updateCommentInTree(list, commentId, {
            isLiked: Boolean(result.isLiked),
            likesCount: Math.max(0, Number(result.likesCount ?? optimisticCount)),
          })
        );
      },
      error: () => {
        // Roll back
        this.reelComments.update((list) =>
          this.updateCommentInTree(list, commentId, { isLiked: wasLiked, likesCount: comment.likesCount })
        );
      }
    });
  }

  /**
   * Delegate getReplies to SocialCommentService (same endpoint /comments/{id}/replies).
   */
  getReelCommentReplies(commentId: string) {
    return this.commentService.getReplies(commentId);
  }

  /**
   * Load replies for a comment and update the signal.
   */
  loadReelCommentReplies(commentId: string) {
    return this.commentService.getReplies(commentId).pipe(
      tap((replies) => {
        this.reelComments.update((list) =>
          this.updateCommentInTree(list, commentId, { replies })
        );
      })
    );
  }

  toggleLike() {
    const reel = this.currentReel();
    if (!reel) return;

    const originalLiked = reel.liked;
    const reelId = reel.id;

    // Optimistic update
    this.reels.update((list) =>
      list.map((r) =>
        r.id === reelId
          ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
          : r
      )
    );

    const request = originalLiked
      ? this.reelService.unlikeReel(reelId)
      : this.reelService.likeReel(reelId);

    request.pipe(take(1)).subscribe({
      next: () => { },
      error: (err) => {
        console.error('Error toggling like', err);
        // Revert optimistic update
        this.reels.update((list) =>
          list.map((r) =>
            r.id === reelId
              ? { ...r, liked: originalLiked, likes: originalLiked ? r.likes + 1 : r.likes - 1 }
              : r
          )
        );
      }
    });
  }

  toggleSave() {
    this.reels.update((list) =>
      list.map((r, i) =>
        i === this.currentIndex()
          ? { ...r, saved: !r.saved, saves: r.saved ? r.saves - 1 : r.saves + 1 }
          : r
      )
    );
  }

  toggleComments() {
    this.showComments.update((v) => !v);
    const reel = this.currentReel();
    if (this.showComments() && reel) {
      this.loadReelCommentsV2(reel.id);
    }
  }

  closeComments() {
    this.showComments.set(false);
  }

  toggleFollow(reelId: string) {
    this.isFollowing.update((map) => ({ ...map, [reelId]: !map[reelId] }));
  }

  isFollowingAuthor(reelId: string): boolean {
    return this.isFollowing()[reelId] ?? false;
  }

  /** @deprecated Use toggleReelCommentLike() which uses SocialCommentService. */
  toggleCommentLike(commentId: string) {
    const reel = this.currentReel();
    if (!reel) return;

    const comment = reel.commentList.find((c) => c.id === commentId);
    if (!comment) return;

    const originalLiked = comment.liked;

    // Optimistic update
    this.reels.update((list) =>
      list.map((r, i) =>
        i === this.currentIndex()
          ? {
            ...r,
            commentList: r.commentList.map((c) =>
              c.id === commentId
                ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
                : c
            ),
          }
          : r
      )
    );

    const request = originalLiked
      ? this.reelService.unlikeComment(commentId)
      : this.reelService.likeComment(commentId);

    request.pipe(take(1)).subscribe({
      next: () => { },
      error: (err) => {
        console.error('Error toggling comment like', err);
        // Revert on error
        this.reels.update((list) =>
          list.map((r, i) =>
            i === this.currentIndex()
              ? {
                ...r,
                commentList: r.commentList.map((c) =>
                  c.id === commentId
                    ? { ...c, liked: originalLiked, likes: originalLiked ? c.likes + 1 : c.likes - 1 }
                    : c
                ),
              }
              : r
          )
        );
      }
    });
  }

  /** @deprecated Use submitReelCommentFull() for full payload support. */
  submitComment() {
    const text = this.newComment().trim();
    if (!text) return;

    const reel = this.currentReel();
    if (!reel) return;

    this.reelService.submitComment(reel.id, text).pipe(take(1)).subscribe({
      next: (response) => {
        const c = response;
        const newC: ReelComment = {
          id: c.id,
          author: c.author?.displayName || c.author?.username || 'Bạn',
          avatar: c.author?.avatarUrl || '',
          text: c.content,
          timeAgo: 'Vừa xong',
          likes: c.likeCount,
          liked: c.isLikedByCurrentUser,
        };

        this.reels.update((list) =>
          list.map((r) =>
            r.id === reel.id
              ? {
                ...r,
                commentList: [newC, ...r.commentList],
                comments: r.comments + 1,
              }
              : r
          )
        );
        this.newComment.set('');
      },
      error: (err) => {
        console.error('Error submitting comment', err);
      }
    });
  }

  goToPrev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
      this.reelComments.set([]);

      if (this.showComments()) {
        const prevReel = this.currentReel();
        if (prevReel) {
          this.loadReelCommentsV2(prevReel.id);
        }
      }
    }
  }

  goToNext() {
    if (this.currentIndex() < this.reels().length - 1) {
      this.currentIndex.update((i) => i + 1);
      this.reelComments.set([]);

      if (this.showComments()) {
        const nextReel = this.currentReel();
        if (nextReel) {
          this.loadReelCommentsV2(nextReel.id);
        }
      }
    }
  }

  goToReel(index: number) {
    this.currentIndex.set(index);
    this.reelComments.set([]);
    if (this.showComments()) {
      const reel = this.currentReel();
      if (reel) {
        this.loadReelCommentsV2(reel.id);
      }
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private findCommentInReelComments(commentId: string, list?: Comment[]): Comment | undefined {
    const source = list ?? this.reelComments();
    for (const c of source) {
      if (c.id === commentId) return c;
      const found = this.findCommentInReelComments(commentId, c.replies ?? []);
      if (found) return found;
    }
    return undefined;
  }

  private updateCommentInTree(
    list: Comment[],
    commentId: string,
    patch: Partial<Comment>
  ): Comment[] {
    return list.map((c) => {
      if (c.id === commentId) {
        return { ...c, ...patch };
      }
      if (c.replies?.length) {
        return { ...c, replies: this.updateCommentInTree(c.replies, commentId, patch) };
      }
      return c;
    });
  }
}
