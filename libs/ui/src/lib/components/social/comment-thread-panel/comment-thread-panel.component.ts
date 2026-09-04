import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Comment, CommentContentFragment, CreateCommentPayload, Post, SocialCommentService, parseCommentContentFragments } from '@fe/domain/social';
import { ApiService } from '@fe/core';
import { UiButton } from '../../../button/button';
import { PostCardComponent } from '../post-card/post-card.component';

export type CommentThreadTargetType = 'post' | 'video' | 'reel' | 'story' | 'product';

export interface CommentThreadTarget {
  id: string;
  type: CommentThreadTargetType;
  title: string;
  description?: string;
  previewImage?: string;
  videoUrl?: string;
  price?: string;
  badge?: string;
  post?: Post;
}


@Component({
  selector: 'lib-comment-thread-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, UiButton, PostCardComponent],
  template: `
    <div class="comment-thread-panel" role="dialog" aria-label="Bình luận">
      <div class="panel-shell">
        <div class="panel-header">
          <div class="panel-header-spacer"></div>
          <div class="panel-header-title">Bài viết của {{ post?.author?.fullName || post?.author?.username || 'người đăng' }}</div>
          <button type="button" class="panel-close-btn" (click)="close.emit()" aria-label="Đóng">✕</button>
        </div>
        <div class="panel-content">
          <div class="panel-body">
            <section class="source-card" *ngIf="post">
              <app-post-card class="post-preview-card" [post]="post" [showReplyBox]="false" [isCompactMode]="true" (close)="close.emit()"></app-post-card>
            </section>

            <section class="comments-root">
              <div class="comments-list">
                <ng-template #commentNode let-comment let-level="level">
                  <div class="comment-node" [style.margin-left.px]="level * 16">
                    <div class="comment-card">
                      <img [src]="comment.author.avatar" [alt]="comment.author.fullName" class="comment-avatar" />
                      <div class="comment-body">
                        <div class="comment-meta">
                          <span class="comment-author">{{ comment.author.fullName }}</span>
                          <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                        </div>
                        <div class="comment-content">
                          <ng-container *ngFor="let fragment of getCommentContentFragments(comment.content, comment.mentionRanges)">
                            <span *ngIf="fragment.type === 'mention'" class="mention" role="button" tabindex="0" (click)="onMentionClick(fragment.username)" (keydown.enter)="onMentionClick(fragment.username)" (keydown.space)="onMentionClick(fragment.username)">{{ fragment.value }}</span>
                            <span *ngIf="fragment.type === 'text'">{{ fragment.value }}</span>
                          </ng-container>
                        </div>
                        <div class="comment-actions">
                          <button type="button" class="action-link like-action" (click)="onToggleLike(comment.id)" [attr.aria-label]="comment.isLiked ? 'Bỏ thích bình luận' : 'Thích bình luận'">
                            <span class="heart-icon" [class.is-liked]="comment.isLiked">
                              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M12 20.25c-1.06-1.1-4.5-3.88-6.66-6.48A5.34 5.34 0 0 1 12 6.75a5.34 5.34 0 0 1 6.66 6.99c-2.16 2.6-5.6 5.38-6.66 6.51Z"/>
                              </svg>
                            </span>
                            <span class="like-count">{{ comment.likesCount || 0 }}</span>
                          </button>
                          <button type="button" class="action-link" (click)="setReplyTarget(comment.id, comment.author.fullName, comment.author.username, comment.author.id)">Phản hồi</button>
                          <button
                            *ngIf="getReplyCount(comment) > 0 && level === 0"
                            type="button"
                            class="action-link reply-count-link"
                            (click)="toggleReplies(comment)"
                          >
                            <ng-container *ngIf="isReplyLoading(comment.id)">Đang tải…</ng-container>
                            <ng-container *ngIf="!isReplyLoading(comment.id)">
                              {{ isReplyExpanded(comment.id) ? 'Thu gọn' : (getReplyCount(comment) + ' phản hồi') }}
                            </ng-container>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="reply-list" *ngIf="isReplyExpanded(comment.id) && getVisibleReplies(comment).length && canRenderReplyChildren(level)">
                      <ng-container *ngFor="let reply of getVisibleReplies(comment); trackBy: trackComment">
                        <ng-container *ngTemplateOutlet="commentNode; context: { $implicit: reply, level: level + 1 }"></ng-container>
                      </ng-container>
                    </div>
                  </div>
                </ng-template>

                <ng-container *ngFor="let comment of comments; trackBy: trackComment">
                  <ng-container *ngTemplateOutlet="commentNode; context: { $implicit: comment, level: 0 }"></ng-container>
                </ng-container>
              </div>
            </section>
          </div>

          <div class="panel-footer">
            <div class="reply-context" *ngIf="replyTargetName">
              Đang trả lời <strong>{{ replyTargetName }}</strong>
            </div>
            <div class="composer">
              <img [src]="currentUserAvatar || 'https://i.pravatar.cc/150?img=12'" class="composer-avatar" alt="Bạn" />
              <div class="composer-input-wrap">
                <div class="composer-input-inner">
                  <textarea
                    rows="2"
                    [(ngModel)]="draftComment"
                    (ngModelChange)="onDraftCommentChange($event)"
                    (keydown.enter)="onComposerKeydown($any($event))"
                    placeholder="Viết bình luận công khai..."
                  ></textarea>
                  <div class="mention-suggestions" *ngIf="showMentionSuggestions && mentionSuggestions.length">
                    <button
                      type="button"
                      class="mention-suggestion"
                      *ngFor="let user of mentionSuggestions"
                      (click)="applyMention(user)"
                    >
                      <img [src]="user.avatar || 'https://i.pravatar.cc/150?img=12'" [alt]="user.name" />
                      <span class="mention-suggestion-name">{{ user.name }}</span>
                      <span class="mention-suggestion-handle">@{{ user.username }}</span>
                    </button>
                  </div>
                  <div class="composer-input-footer">
                    <div class="composer-input-icons">
                      <lib-button variant="ghost" type="button" class="composer-icon-btn" title="Emoji">😊</lib-button>
                      <lib-button variant="ghost" type="button" class="composer-icon-btn" title="Ảnh">🖼️</lib-button>
                      <lib-button variant="ghost" type="button" class="composer-icon-btn" title="GIF">GIF</lib-button>
                    </div>
                  </div>
                  <lib-button
                    variant="primary"
                    type="button"
                    class="composer-send-btn"
                    [disabled]="!draftComment.trim()"
                    (click)="onSubmitComment()"
                    aria-label="Gửi bình luận"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                    </svg>
                  </lib-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .comment-thread-panel {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.12);
        z-index: 10050;
        display: flex;
        justify-content: center;
        align-items: stretch;
        padding: 0 1rem;
        pointer-events: auto;
        overflow: hidden;
        overscroll-behavior: none;
      }
      .comment-thread-panel::before {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.08);
        z-index: -1;
      }
      @media (min-width: 1200px) {
        .comment-thread-panel {
          padding-inline: 1.5rem;
          justify-content: center;
        }
      }
      .panel-shell {
        width: min(100%, calc(var(--page-main-width, 42rem) + 2.2rem));
        max-width: min(100%, min(92vw, 1200px));
        height: 100vh;
        max-height: 100vh;
        background: var(--color-surface-base, #ffffff);
        border-radius: calc(var(--padding-scale, 1) * 0.35rem);
        box-shadow: 0 6px 20px color-mix(in srgb, var(--color-text-base, #0f172a) 10%, transparent);
        overflow: hidden;
        border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        pointer-events: auto;
        display: flex;
        flex-direction: column;
      }
      .panel-header {
        display: grid;
        grid-template-columns: 2.5rem 1fr 2.5rem;
        align-items: center;
        padding: calc(var(--padding-scale, 1) * 0.1rem) calc(var(--padding-scale, 1) * 0.1rem);
        border-bottom: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        background: var(--color-surface-base, #ffffff);
      }
      .panel-header-spacer {
        width: 2.5rem;
        height: 2.5rem;
      }
      .panel-header-title {
        text-align: center;
        font-size: calc(var(--font-size-caption, 0.875rem) + 0.1rem);
        font-weight: var(--font-weight-strong, 700);
        color: var(--color-text-base, #0f172a);
        font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .panel-close-btn {
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        background: transparent;
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
        font-size: 1rem;
        cursor: pointer;
        border-radius: 999px;
      }
      .panel-close-btn:hover {
        background: rgba(15, 23, 42, 0.04);
      }
      .panel-content {
        display: grid;
        grid-template-rows: 1fr auto;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      .panel-body {
        overflow: auto;
        display: grid;
        gap: calc(var(--padding-scale, 1) * 1rem);
        padding: calc(var(--padding-scale, 1) * 1rem) calc(var(--padding-scale, 1) * 1rem) calc(var(--padding-scale, 1) * 0.5rem);
      }
      .source-card {
        padding: 0;
        border: none;
        background: transparent;
      }
      .post-preview-card {
        display: block;
        width: 100%;
        border: none;
        border-radius: 0;
        background: transparent;
      }
      .source-media {
        width: 180px;
        min-width: 180px;
        aspect-ratio: 16 / 9;
        border-radius: calc(var(--padding-scale, 1) * 0.75rem);
        overflow: hidden;
        background: var(--color-surface-subtle, #f1f5f9);
      }
      .source-media img,
      .source-media video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .source-info h3 {
        margin: 0 0 calc(var(--padding-scale, 1) * 0.375rem);
        font-size: var(--font-size-body, 1rem);
        color: var(--color-text-base, #0f172a);
        font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      }
      .source-info p {
        margin: 0;
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
        font-size: var(--font-size-caption, 0.875rem);
        line-height: 1.5;
        font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      }
      .source-badge {
        display: inline-flex;
        margin-bottom: calc(var(--padding-scale, 1) * 0.5rem);
        padding: calc(var(--padding-scale, 1) * 0.25rem) calc(var(--padding-scale, 1) * 0.5rem);
        border-radius: 999px;
        background: color-mix(in srgb, var(--color-brand-primary, #1d9bf0) 12%, transparent);
        color: var(--color-brand-primary, #1d9bf0);
        font-size: calc(var(--font-size-scale, 1) * 0.75rem);
        font-weight: var(--font-weight-strong, 700);
      }
      .source-price {
        margin-top: calc(var(--padding-scale, 1) * 0.5rem);
        font-weight: var(--font-weight-strong, 700);
        color: var(--color-text-base, #0f172a);
      }
      .comments-root {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .comment-node {
        border-bottom: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        padding-bottom: calc(var(--padding-scale, 1) * 0.75rem);
      }
      .comment-card, .reply-card {
        display: flex;
        gap: 10px;
      }
      .comment-card {
        align-items: flex-start;
      }
      .reply-list {
        margin-left: 36px;
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .comment-avatar, .reply-avatar {
        width: 38px;
        height: 38px;
        border-radius: 999px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .comment-body, .reply-body {
        flex: 1;
        min-width: 0;
      }
      .comment-meta, .reply-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .comment-author, .reply-author {
        font-weight: var(--font-weight-strong, 700);
        color: var(--color-text-base, #0f172a);
        font-size: var(--font-size-label);
        font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      }
      .comment-time, .reply-time {
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
        font-size: var(--font-size-label);
      }
      .comment-content, .reply-content {
        margin: 0;
        color: var(--color-text-base, #0f172a);
        font-size: var(--font-size-label);
        line-height: 1.4;
        font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
        white-space: pre-wrap;
      }
      .comment-actions, .reply-actions {
        display: flex;
        gap: 10px;
        margin-top: 6px;
        align-items: center;
        flex-wrap: wrap;
      }
      .action-link {
        background: none;
        border: none;
        color: var(--color-brand-primary, #1d9bf0);
        font-size: var(--font-size-label);
        font-weight: 400;
        cursor: pointer;
        padding: 0;
        font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      }
      .like-action {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
      }
      .heart-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
      }
      .heart-icon svg {
        width: 0.95rem;
        height: 0.95rem;
        fill: currentColor;
      }
      .heart-icon.is-liked {
        color: #ef4444;
      }
      .like-count {
        font-size: var(--font-size-label);
        line-height: 1;
        color: inherit;
      }
      .reply-count-link {
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
      }
      .comment-stats {
        font-size: var(--font-size-label);
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
      }
      .mention {
        color: var(--color-brand-primary, #1d9bf0);
        font-weight: var(--font-weight-strong, 700);
      }
      .mention-suggestions {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-top: 0.4rem;
        padding: 0.35rem;
        border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        border-radius: calc(var(--padding-scale, 1) * 0.5rem);
        background: var(--color-surface-subtle, #f8fafc);
      }
      .mention-suggestion {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        width: 100%;
        border: none;
        background: transparent;
        padding: 0.35rem 0.45rem;
        border-radius: calc(var(--padding-scale, 1) * 0.35rem);
        cursor: pointer;
        text-align: left;
      }
      .mention-suggestion:hover {
        background: var(--color-surface-hover, rgba(15, 23, 42, 0.04));
      }
      .mention-suggestion img {
        width: 1.6rem;
        height: 1.6rem;
        border-radius: 999px;
        object-fit: cover;
      }
      .mention-suggestion-name {
        font-weight: var(--font-weight-strong, 700);
        color: var(--color-text-base, #0f172a);
      }
      .mention-suggestion-handle {
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
      }
      .panel-footer {
        border-top: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        padding: calc(var(--padding-scale, 1) * 1rem) calc(var(--padding-scale, 1) * 1.5rem) calc(var(--padding-scale, 1) * 1.25rem);
        background: var(--color-surface-base, #ffffff);
      }
      .reply-context {
        margin-bottom: calc(var(--padding-scale, 1) * 0.5rem);
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
        font-size: var(--font-size-caption, 0.875rem);
        font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      }
      .composer {
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }
      .composer-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }
      .composer-input-wrap {
        flex: 1;
      }
      .composer-input-inner {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        border-radius: calc(var(--padding-scale, 1) * 0.75rem);
        background: var(--color-surface-base, #ffffff);
        padding: calc(var(--padding-scale, 1) * 0.45rem);
      }
      textarea {
        width: 100%;
        border: none;
        outline: none;
        resize: none;
        min-height: 44px;
        max-height: 80px;
        line-height: 1.5;
        font: inherit;
        background: transparent;
        color: var(--color-text-base, #0f172a);
        font-size: var(--font-size-label);
        font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
        padding: 0;
      }
      textarea::placeholder {
        color: var(--color-text-muted, rgba(15, 23, 42, 0.64));
      }
      .composer-input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        padding-right: 2.6rem;
        padding-bottom: 0.2rem;
      }
      .composer-input-icons {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .composer-icon-btn {
        min-width: 2rem;
        min-height: 2rem;
        padding: 0.25rem;
        border-radius: calc(var(--button-radius, calc(var(--padding-scale, 1) * 0.375rem)));
        font-size: 0.95rem;
      }
      .composer-send-btn {
        position: absolute;
        right: calc(var(--padding-scale, 1) * 0.7rem);
        bottom: calc(var(--padding-scale, 1) * 0.55rem);
        width: 2.4rem;
        height: 2.4rem;
        min-width: auto;
        padding: 0;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
      }
      .composer-send-btn svg {
        width: 1rem;
        height: 1rem;
        fill: currentColor;
      }
      .composer-actions {
        display: none;
      }
      @media (max-width: 768px) {
        .comment-thread-panel { padding: 0; }
        .panel-shell { width: 100%; height: 100%; max-height: 100vh; border-radius: 0; }
        .source-card { flex-direction: column; }
        .source-media { width: 100%; min-width: 0; }
      }
    `,
  ],
})
export class CommentThreadPanelComponent {
  private readonly socialCommentService = inject(SocialCommentService);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  @Input() target!: CommentThreadTarget;
  @Input() post?: Post;
  @Input() comments: Comment[] = [];
  @Input() currentUserAvatar?: string;
  @Output() close = new EventEmitter<void>();
  @Output() submitComment = new EventEmitter<CreateCommentPayload>();
  @Output() toggleLike = new EventEmitter<string>();

  draftComment = '';
  replyTargetId?: string;
  replyTargetName?: string;
  mentionedUsers: string[] = [];
  mentionRanges: Array<{ userId: string; start: number; end: number }> = [];
  mentionQuery = '';
  mentionSuggestions: Array<{ id: string; name: string; username: string; displayName?: string; avatar: string | null }> = [];
  showMentionSuggestions = false;
  private readonly expandedReplyIds = new Set<string>();
  private readonly loadingReplyIds = new Set<string>();
  private readonly loadedReplyIds = new Set<string>();
  private readonly cdr = inject(ChangeDetectorRef);

  onSubmitComment(): void {
    const content = this.draftComment.trim();
    if (!content) {
      return;
    }

    const resolvedParentId = this.resolveTopLevelParentId(this.replyTargetId);
    const normalized = this.normalizeMentionPayload(content, this.mentionRanges);

    this.submitComment.emit({
      postId: this.target.id,
      content: normalized.content,
      replyToCommentId: resolvedParentId,
      mentionedUsers: this.mentionedUsers,
      mentionedUserIds: this.mentionedUsers,
      mentionRanges: normalized.mentionRanges,
    });

    this.resetComposer();
  }

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
        ...this.mentionRanges.filter((range) => range.userId !== user.id),
        { userId: user.id, start, end },
      ];
    }

    this.mentionSuggestions = [];
    this.showMentionSuggestions = false;
    this.mentionQuery = '';
    this.cdr.markForCheck();
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmitComment();
    }
  }

  onToggleLike(commentId: string): void {
    const comment = this.findCommentById(this.comments, commentId);
    if (!comment) {
      this.toggleLike.emit(commentId);
      return;
    }

    const wasLiked = Boolean(comment.isLiked);
    const optimisticLikesCount = Math.max(0, comment.likesCount + (wasLiked ? -1 : 1));

    comment.isLiked = !wasLiked;
    comment.likesCount = optimisticLikesCount;
    this.cdr.markForCheck();
    this.toggleLike.emit(commentId);

    this.socialCommentService.toggleCommentLike(commentId, wasLiked).subscribe({
      next: (result) => {
        comment.isLiked = Boolean(result.isLiked);
        comment.likesCount = Math.max(0, Number(result.likesCount ?? optimisticLikesCount));
        this.cdr.markForCheck();
      },
      error: () => {
        comment.isLiked = wasLiked;
        comment.likesCount = Math.max(0, comment.likesCount + (wasLiked ? 1 : -1));
        this.cdr.markForCheck();
      },
    });
  }

  toggleReplies(comment: Comment): void {
    const commentId = comment.id;
    const hasReplies = (comment.replies?.length ?? 0) > 0;
    const hasReplyCount = (comment.replyCount ?? 0) > 0;

    if ((comment.replyCount ?? 0) <= 0 && !hasReplies) {
      return;
    }

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

    this.socialCommentService.getReplies(commentId).subscribe({
      next: (replies) => {
        comment.replies = replies;
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

  private findCommentById(comments: Comment[], commentId: string): Comment | undefined {
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment;
      }

      const nestedComment = this.findCommentById(comment.replies ?? [], commentId);
      if (nestedComment) {
        return nestedComment;
      }
    }

    return undefined;
  }

  private resolveTopLevelParentId(commentId?: string): string | undefined {
    if (!commentId) {
      return undefined;
    }

    const findTopLevelParent = (currentId: string, visited = new Set<string>()): string => {
      const currentComment = this.findCommentById(this.comments, currentId);
      if (!currentComment) {
        return currentId;
      }

      if (currentComment.parentId) {
        if (visited.has(currentComment.parentId)) {
          return currentId;
        }
        visited.add(currentComment.parentId);
        return findTopLevelParent(currentComment.parentId, visited);
      }

      return currentId;
    };

    return findTopLevelParent(commentId);
  }

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
        ...this.mentionRanges.filter((range) => range.userId !== authorId),
        { userId: authorId, start, end },
      ];
    }
  }

  private normalizeMentionPayload(content: string, mentionRanges: Array<{ userId: string; start: number; end: number }>) {
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

        return {
          userId: range.userId,
          start: adjustedStart,
          end: adjustedEnd,
        };
      });

    return { content: normalizedContent, mentionRanges: normalizedRanges };
  }

  formatTime(value: Date): string {
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'vừa xong';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  getCommentContentFragments(content: string, mentionRanges?: Array<{ userId: string; start: number; end: number }>): CommentContentFragment[] {
    return parseCommentContentFragments(content, mentionRanges);
  }

  onMentionClick(username?: string): void {
    if (!username) {
      return;
    }

    void this.router.navigate(['/profile']);
  }

  canRenderReplyChildren(level: number): boolean {
    return level < 1;
  }

  trackComment(_: number, item: Comment): string {
    return item.id;
  }
}
