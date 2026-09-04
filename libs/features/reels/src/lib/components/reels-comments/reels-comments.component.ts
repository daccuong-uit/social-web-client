import {
  Component,
  inject,
  ChangeDetectorRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, ApiService } from '@fe/core';
import {
  SocialReelFacade,
  Comment,
  CreateCommentPayload,
  parseCommentContentFragments,
  CommentContentFragment,
} from '@fe/domain/social';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  selector: 'fe-reels-comments',
  templateUrl: './reels-comments.component.html',
  styleUrls: ['./reels-comments.component.css'],
})
export class ReelsCommentsComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  reelsService = inject(SocialReelFacade);

  user = this.authService.user;

  constructor() {
    effect(() => {
      // Listen to reel changes
      this.reelsService.currentIndex();
      
      // Reset state when reel changes
      this.expandedReplyIds.clear();
      this.loadingReplyIds.clear();
      this.loadedReplyIds.clear();
      this.resetComposer();
      this.cdr.markForCheck();
    });
  }

  // ─── Composer state ────────────────────
  draftComment = '';
  replyTargetId?: string;
  replyTargetName?: string;
  mentionedUsers: string[] = [];
  mentionRanges: Array<{ userId: string; start: number; end: number }> = [];
  mentionQuery = '';
  mentionSuggestions: Array<{ id: string; name: string; username: string; displayName?: string; avatar: string | null }> = [];
  showMentionSuggestions = false;

  // ─── Reply expand/collapse state ────────────────────────────────────────────
  private readonly expandedReplyIds = new Set<string>();
  private readonly loadingReplyIds = new Set<string>();
  private readonly loadedReplyIds = new Set<string>();

  // ─── Comment panel open/close ────────────────────────────────────────────────

  onCloseComments(): void {
    this.reelsService.closeComments();
    this.resetComposer();
    this.expandedReplyIds.clear();
    this.loadingReplyIds.clear();
    this.loadedReplyIds.clear();
  }

  // ─── Submit comment ──────────────────────────────────────────────────────────

  onSubmitComment(): void {
    const content = this.draftComment.trim();
    if (!content) return;

    const reel = this.reelsService.currentReel();
    if (!reel) return;

    const resolvedParentId = this.resolveTopLevelParentId(this.replyTargetId);
    const normalized = this.normalizeMentionPayload(content, this.mentionRanges);

    const currentUser = this.authService.user();
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticComment: Comment = {
      id: optimisticId,
      author: {
        id: currentUser?.userId ?? currentUser?.id ?? 'me',
        username: currentUser?.username ?? 'me',
        fullName: currentUser?.displayName ?? currentUser?.username ?? 'Bạn',
        avatar: 'https://i.pravatar.cc/150?img=12',
        bio: '',
        followers: 0,
        following: 0,
        postsCount: 0,
        isFollowing: false,
        isFollowedBy: false,
        isBlocked: false,
        isMuted: false,
      },
      postId: reel.id,
      content: normalized.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      isLiked: false,
      replies: [],
      mentionedUsers: this.mentionedUsers,
      mentionRanges: normalized.mentionRanges,
      replyCount: 0,
      parentId: resolvedParentId ?? null,
    };

    const payload: CreateCommentPayload = {
      postId: reel.id,
      content: normalized.content,
      replyToCommentId: resolvedParentId,
      mentionedUsers: this.mentionedUsers,
      mentionedUserIds: this.mentionedUsers,
      mentionRanges: normalized.mentionRanges,
    };

    this.reelsService.submitReelCommentFull(reel.id, payload, optimisticComment);
    this.resetComposer();
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmitComment();
    }
  }

  // ─── Draft / mention ─────────────────────────────────────────────────────────

  onDraftCommentChange(value: string): void {
    this.draftComment = value;
    this.updateMentionSuggestions();
  }

  private updateMentionSuggestions(): void {
    const match = this.draftComment.match(/(?:^|\s)@([^\s@]*)$/);
    const query = match?.[1] ?? '';

    if (!query.trim()) {
      this.mentionQuery = '';
      this.mentionSuggestions = [];
      this.showMentionSuggestions = false;
      return;
    }

    this.mentionQuery = query.trim();
    this.apiService.get<any>('/friendship/friends', {
      params: { page: 1, pageSize: 8 },
    }).subscribe({
      next: (res) => {
        const users = Array.isArray(res?.data) ? res.data : [];
        const normalizedQuery = this.mentionQuery.toLowerCase();

        this.mentionSuggestions = users
          .filter((user: any) => {
            const fullName = `${user?.fullName ?? ''} ${user?.username ?? ''}`.toLowerCase();
            return fullName.includes(normalizedQuery);
          })
          .slice(0, 6)
          .map((user: any) => ({
            id: user?.id ?? user?.userId ?? '',
            name: user?.fullName ?? user?.username ?? 'Người dùng',
            username: user?.username ?? 'user',
            displayName: user?.fullName ?? user?.username ?? 'Người dùng',
            avatar: user?.avatar ?? user?.avatarUrl ?? null,
          }));

        this.showMentionSuggestions = this.mentionSuggestions.length > 0;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mentionSuggestions = [];
        this.showMentionSuggestions = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyMention(user: { id: string; name: string; username: string; displayName?: string; avatar: string | null }): void {
    const lastAtIndex = this.draftComment.lastIndexOf('@');
    const before = this.draftComment.slice(0, lastAtIndex >= 0 ? lastAtIndex : this.draftComment.length);
    const mentionLabel = user.displayName || user.name || user.username;
    const mentionValue = `@${mentionLabel}`;
    this.draftComment = `${before}${mentionValue} `;

    const start = before.length;
    const end = start + mentionLabel.length;

    if (user.id && !this.mentionedUsers.includes(user.id)) {
      this.mentionedUsers = [...this.mentionedUsers, user.id];
    }
    if (user.id) {
      this.mentionRanges = [
        ...this.mentionRanges.filter((r) => r.userId !== user.id),
        { userId: user.id, start, end },
      ];
    }

    this.mentionSuggestions = [];
    this.showMentionSuggestions = false;
    this.mentionQuery = '';
    this.cdr.markForCheck();
  }

  // ─── Reply target ────────────────────────────────────────────────────────────

  setReplyTarget(commentId: string, authorName: string, authorUsername?: string, authorId?: string): void {
    this.replyTargetId = commentId;
    this.replyTargetName = authorName;

    const mentionHandle = authorName || authorUsername || 'user';
    const mentionValue = `@${mentionHandle}`;

    if (!this.draftComment.trim()) {
      this.draftComment = `${mentionValue} `;
    } else if (!this.draftComment.includes(mentionValue)) {
      this.draftComment = `${this.draftComment} ${mentionValue}`;
    }

    const rawMentionIndex = this.draftComment.lastIndexOf(mentionValue);
    const start = rawMentionIndex !== -1 ? rawMentionIndex : 0;
    const end = start + mentionHandle.length;

    if (authorId && !this.mentionedUsers.includes(authorId)) {
      this.mentionedUsers = [...this.mentionedUsers, authorId];
    }
    if (authorId) {
      this.mentionRanges = [
        ...this.mentionRanges.filter((r) => r.userId !== authorId),
        { userId: authorId, start, end },
      ];
    }
  }

  clearReplyTarget(): void {
    this.replyTargetId = undefined;
    this.replyTargetName = undefined;
  }

  // ─── Like comment ────────────────────────────────────────────────────────────

  onToggleLike(commentId: string): void {
    this.reelsService.toggleReelCommentLike(commentId);
  }

  // ─── Replies expand/collapse ─────────────────────────────────────────────────

  toggleReplies(comment: Comment): void {
    const commentId = comment.id;
    const hasReplies = (comment.replies?.length ?? 0) > 0;
    const replyCount = comment.replyCount ?? 0;

    if (replyCount <= 0 && !hasReplies) return;

    if (this.expandedReplyIds.has(commentId)) {
      this.expandedReplyIds.delete(commentId);
      this.cdr.markForCheck();
      return;
    }

    if (hasReplies) {
      this.expandedReplyIds.add(commentId);
      this.cdr.markForCheck();
      return;
    }

    if (this.loadingReplyIds.has(commentId) || this.loadedReplyIds.has(commentId)) {
      if (!this.loadingReplyIds.has(commentId)) {
        this.expandedReplyIds.add(commentId);
      }
      this.cdr.markForCheck();
      return;
    }

    this.loadingReplyIds.add(commentId);
    this.cdr.markForCheck();

    this.reelsService.loadReelCommentReplies(commentId).subscribe({
      next: () => {
        this.loadedReplyIds.add(commentId);
        this.expandedReplyIds.add(commentId);
        this.loadingReplyIds.delete(commentId);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingReplyIds.delete(commentId);
        this.cdr.markForCheck();
      },
    });
  }

  isReplyExpanded(commentId: string): boolean {
    return this.expandedReplyIds.has(commentId);
  }

  isReplyLoading(commentId: string): boolean {
    return this.loadingReplyIds.has(commentId);
  }

  getReplyCount(comment: Comment): number {
    return comment.replyCount ?? comment.replies?.length ?? 0;
  }

  getVisibleReplies(comment: Comment): Comment[] {
    return comment.replies ?? [];
  }

  canRenderReplyChildren(level: number): boolean {
    return level < 1;
  }

  // ─── Mention rendering ───────────────────────────────────────────────────────

  getCommentContentFragments(
    content: string,
    mentionRanges?: Array<{ userId: string; start: number; end: number }>
  ): CommentContentFragment[] {
    return parseCommentContentFragments(content, mentionRanges);
  }

  onMentionClick(username?: string): void {
    if (!username) return;
    void this.router.navigate(['/profile']);
  }

  // ─── Misc ────────────────────────────────────────────────────────────────────

  formatTime(value: Date): string {
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'vừa xong';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  trackComment(_: number, item: Comment): string {
    return item.id;
  }

  get currentUserAvatar(): string {
    return 'https://i.pravatar.cc/150?img=12';
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private resetComposer(): void {
    this.draftComment = '';
    this.replyTargetId = undefined;
    this.replyTargetName = undefined;
    this.mentionedUsers = [];
    this.mentionRanges = [];
    this.mentionQuery = '';
    this.mentionSuggestions = [];
    this.showMentionSuggestions = false;
  }

  private resolveTopLevelParentId(commentId?: string): string | undefined {
    if (!commentId) return undefined;

    const findTop = (currentId: string, visited = new Set<string>()): string => {
      const c = this.findCommentById(this.reelsService.reelComments(), currentId);
      if (!c) return currentId;
      if (c.parentId) {
        if (visited.has(c.parentId)) return currentId;
        visited.add(c.parentId);
        return findTop(c.parentId, visited);
      }
      return currentId;
    };

    return findTop(commentId);
  }

  private findCommentById(list: Comment[], id: string): Comment | undefined {
    for (const c of list) {
      if (c.id === id) return c;
      const found = this.findCommentById(c.replies ?? [], id);
      if (found) return found;
    }
    return undefined;
  }

  private normalizeMentionPayload(
    content: string,
    mentionRanges: Array<{ userId: string; start: number; end: number }>
  ) {
    let normalizedContent = content;
    let offset = 0;

    const normalizedRanges = [...mentionRanges]
      .sort((a, b) => a.start - b.start)
      .map((range) => {
        const rawStart = range.start + offset;
        const rawEnd = range.end + offset;
        let adjustedStart = rawStart;
        let adjustedEnd = rawEnd + 1;

        if (normalizedContent[rawStart] === '@') {
          normalizedContent = `${normalizedContent.slice(0, rawStart)}${normalizedContent.slice(rawStart + 1)}`;
          offset -= 1;
          adjustedEnd -= 1;
        }

        return { userId: range.userId, start: adjustedStart, end: adjustedEnd };
      });

    return { content: normalizedContent, mentionRanges: normalizedRanges };
  }
}
