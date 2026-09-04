/**
 * @fileoverview Post Card Component
 */

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '@fe/domain/social';
import { RelativeTimePipe } from '@fe/core';

const CONTENT_LIMIT = 280; // chars before truncating

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, PostCardComponent, RelativeTimePipe],
  template: `
    <article class="post-card" *ngIf="post">
      <div class="post-card-header">
        <div class="post-author">
          <div class="avatar" [style.background-image]="'url(' + post.author.avatar + ')'" ></div>
          <div class="author-info">
            <div class="author-name-row">
              <span class="author-name">{{ post.author.fullName || post.author.username }}</span>
              <span class="post-time">{{ post.createdAt | relativeTime }}</span>
            </div>
            <span class="author-handle">@{{ post.author.username }}</span>
          </div>
        </div>

        <button *ngIf="!isCompactMode" type="button" class="more-btn" aria-label="Thêm tùy chọn" (click)="onMoreOptions()">···</button>
      </div>

      <p class="post-text" [class.truncated]="!isExpanded() && post.content.length > contentLimit">
        {{ isExpanded() || post.content.length <= contentLimit ? post.content : post.content.slice(0, contentLimit) + '...' }}
      </p>
      <button class="see-more-btn" *ngIf="post.content.length > contentLimit" (click)="isExpanded.set(!isExpanded())">
        {{ isExpanded() ? 'Thu gọn' : 'Xem thêm' }}
      </button>

      <div class="post-tags" *ngIf="post.hashtags.length || post.mentions.length">
        <span class="tag" *ngFor="let tag of post.hashtags">#{{ tag }}</span>
        <span class="tag mention" *ngFor="let mention of post.mentions">@{{ mention }}</span>
      </div>

      <ng-container *ngIf="post.originalPost; else mediaTemplate">
        <div class="nested-post-wrapper">
          <app-post-card [post]="post.originalPost" [isCompactMode]="true" class="nested-post-card"></app-post-card>
        </div>
      </ng-container>

      <ng-template #mediaTemplate>
        <div class="post-media"
          *ngIf="post.images && post.images.length"
        [class.media-1]="post.images.length === 1"
        [class.media-2]="post.images.length === 2"
        [class.media-3]="post.images.length === 3"
        [class.media-4plus]="post.images.length >= 4">
        <div class="media-item"
          *ngFor="let image of post.images.slice(0, 4); let i = index"
          [class.hidden-on-mobile]="post.images.length > 4 && i >= 4">
          <img [src]="image" [alt]="'Ảnh bài viết ' + (i + 1)" loading="lazy" />
          <div class="media-overlay-count"
            *ngIf="post.images.length > 4 && i === 3">
            +{{ post.images.length - 4 }}
          </div>
        </div>
      </div>
      </ng-template>

      <div class="post-divider" *ngIf="!isCompactMode"></div>

      <div class="post-actions" *ngIf="!isCompactMode">
        <button class="action-btn action-like" [class.liked]="post.isLiked" type="button" (click)="onToggleLike()" aria-label="Yêu thích">
          <span class="action-count">{{ post.likesCount }}</span>
          <span class="icon" [class.liked]="post.isLiked">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16.5 3.5c-1.74 0-3.41.81-4.5 2.09C10.91 4.31 9.24 3.5 7.5 3.5 4.42 3.5 2 5.92 2 9c0 4.28 4.5 7.74 9.55 12.04L12 21.35l.45-.31C17.5 16.74 22 13.28 22 9c0-3.08-2.42-5.5-5.5-5.5z" />
            </svg>
          </span>
        </button>
        <button class="action-btn action-comment" type="button" (click)="onComment()" aria-label="Bình luận">
          <span class="action-count">{{ post.commentsCount }}</span>
          <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
        </button>
        <button class="action-btn action-share" type="button" (click)="onShareClick()" aria-label="Chia sẻ">
          <span class="action-count">{{ post.sharesCount }}</span>
          <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </span>
        </button>
      </div>
    </article>
  `,
  styles: [
    `
      .post-card {
        width: 100%;
        padding: calc(12px * var(--padding-scale, 1));
        display: flex;
        flex-direction: column;
        gap: calc(8px * var(--padding-scale, 1));
        background: var(--color-surface-base, #ffffff);
        border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        border-radius: 8px;
        transition: background 0.2s ease;
        box-sizing: border-box;
      }
      .post-card:hover {
        background: var(--color-surface-subtle, rgba(29, 155, 240, 0.04));
      }
      .post-card-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: calc(12px * var(--padding-scale, 1));
      }
      .post-author {
        display: flex;
        gap: calc(12px * var(--padding-scale, 1));
      }
      .avatar {
        min-width: calc(40px * var(--padding-scale, 1));
        width: calc(40px * var(--padding-scale, 1));
        height: calc(40px * var(--padding-scale, 1));
        border-radius: 50%;
        background-color: var(--color-surface-subtle, #f3f4f6);
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
      }
      .author-info {
        display: flex;
        flex-direction: column;
        gap: calc(2px * var(--padding-scale, 1));
        min-width: 0;
      }
      .author-name-row {
        display: flex;
        align-items: center;
        gap: calc(6px * var(--padding-scale, 1));
        flex-wrap: wrap;
      }
      .author-name {
        font-size: var(--font-size-body);
        font-weight: 700;
        color: var(--color-text-base, #0f172a);
      }
      .author-handle,
      .post-time,
      .post-bullet {
        font-size: var(--font-size-caption);
        color: var(--color-text-muted, rgba(0, 0, 0, 0.6));
        font-weight: 500;
      }
      .author-secondary {
        margin: 0;
        color: var(--color-text-muted, rgba(0, 0, 0, 0.68));
        font-size: var(--font-size-caption);
        line-height: 1.45;
      }
      .more-btn {
        border: none;
        background: transparent;
        color: var(--color-text-muted, rgba(0, 0, 0, 0.55));
        font-size: var(--font-size-label);
        cursor: pointer;
        padding: calc(6px * var(--padding-scale, 1));
        border-radius: 9999px;
        transition: background 0.2s ease, color 0.2s ease;
      }
      .more-btn:hover {
        background: rgba(15, 23, 42, 0.04);
      }
      .post-text {
        margin: 0;
        font-size: var(--font-size-body);
        line-height: 1.4;
        color: var(--color-text-base, #0f172a);
        word-break: break-word;
      }
      .post-tags {
        display: flex;
        flex-wrap: wrap;
        gap: calc(10px * var(--padding-scale, 1));
      }
      .tag {
        font-size: var(--font-size-caption);
        color: var(--color-brand-primary, #1d9bf0);
        cursor: pointer;
        transition: opacity 0.2s ease;
      }
      .tag:hover {
        opacity: 0.85;
      }
      .post-media {
        display: grid;
        gap: 3px;
        border-radius: calc(12px * var(--padding-scale, 1));
        overflow: hidden;
        margin-top: calc(6px * var(--padding-scale, 1));
        width: 100%;
      }
      .post-media.media-1 { grid-template-columns: 1fr; }
      .post-media.media-2 { grid-template-columns: 1fr 1fr; }
      .post-media.media-3 { grid-template-columns: 1fr 1fr; }
      .post-media.media-3 .media-item:first-child { grid-column: 1 / -1; }
      .post-media.media-4plus { grid-template-columns: 1fr 1fr; }

      .media-item {
        position: relative;
        overflow: hidden;
        background: var(--color-surface-subtle, #f0f2f5);
      }

      .media-item img {
        width: 100%;
        height: 160px;
        object-fit: cover;
        display: block;
        transition: transform 0.2s ease;
      }
      .post-media.media-1 .media-item img {
        height: auto;
        max-height: 500px;
      }
      .media-item:hover img {
        transform: scale(1.02);
      }

      .media-overlay-count {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 28px;
        font-weight: 700;
      }
      .nested-post-wrapper {
        margin-top: calc(8px * var(--padding-scale, 1));
        border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        border-radius: 8px;
        overflow: hidden;
      }
      .post-actions {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        gap: calc(8px * var(--padding-scale, 1));
        padding-top: calc(4px * var(--padding-scale, 1));
      }
      .post-actions .action-btn {
        display: inline-flex;
        align-items: center;
        gap: calc(6px * var(--padding-scale, 1));
        border: none;
        background: transparent;
        color: var(--color-text-muted, rgba(107, 114, 128, 0.85));
        cursor: pointer;
        font-size: var(--font-size-caption);
        padding: calc(8px * var(--padding-scale, 1)) calc(12px * var(--padding-scale, 1));
        height: calc(38px * var(--padding-scale, 1));
        border-radius: 9999px;
        white-space: nowrap;
        transition: background 0.2s ease, color 0.2s ease;
      }
      .post-actions .action-btn:hover {
        background: rgba(29, 155, 240, 0.08);
        color: var(--color-text-base, #0f172a);
      }
      .post-actions .action-count {
        font-weight: 700;
        color: var(--color-text-base, #0f172a);
      }
      .post-actions .action-btn .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: calc(20px * var(--padding-scale, 1));
        height: calc(20px * var(--padding-scale, 1));
      }
      .post-actions .action-btn .icon svg {
        width: 100%;
        height: 100%;
        display: block;
        fill: currentColor;
      }
      .post-actions .action-like:hover {
        background: rgba(255, 56, 92, 0.12);
        color: #e0245e;
      }
      .post-actions .action-like.liked {
        color: #e0245e;
      }
      .post-actions .action-like .icon.liked svg {
        fill: #e0245e;
      }
      .post-actions .action-comment:hover,
      .post-actions .action-share:hover {
        background: rgba(15, 23, 42, 0.06);
      }
      
      .action-btn-wrapper {
        position: relative;
      }
      .share-dropdown {
        position: absolute;
        bottom: 100%;
        left: 0;
        margin-bottom: 4px;
        background: var(--color-surface-base, #ffffff);
        border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 4px;
        display: flex;
        flex-direction: column;
        z-index: 10;
        min-width: 150px;
      }
      .share-dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: var(--font-size-body);
        color: var(--color-text-base, #0f172a);
        text-align: left;
        border-radius: 4px;
        transition: background 0.2s ease;
      }
      .share-dropdown-item:hover {
        background: rgba(29, 155, 240, 0.08);
      }

      /* Stats Bar */
      .post-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: calc(6px * var(--padding-scale, 1)) 0;
        font-size: var(--font-size-caption);
        color: var(--color-text-muted, #65676b);
      }
      .stats-reactions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .reaction-icons {
        display: inline-flex;
      }
      .reaction-icon {
        font-size: 16px;
        line-height: 1;
      }
      .stats-right {
        display: flex;
        gap: 8px;
      }
      .stats-right span {
        cursor: pointer;
      }
      .stats-right span:hover {
        text-decoration: underline;
      }

      /* Divider */
      .post-divider {
        height: 1px;
        background: var(--color-border-subtle, rgba(148, 163, 184, 0.24));
        margin: calc(4px * var(--padding-scale, 1)) 0;
      }

      /* See More Button */
      .see-more-btn {
        border: none;
        background: transparent;
        color: var(--color-text-muted, #65676b);
        font-weight: 600;
        font-size: var(--font-size-caption);
        cursor: pointer;
        padding: 0;
        margin-top: -8px;
        transition: color 0.15s;
      }
      .see-more-btn:hover {
        color: var(--color-text-base, #050505);
      }
    `
  ],
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() showReplyBox = true;
  @Input() isCompactMode = false;
  @Output() toggleLike = new EventEmitter<void>();
  @Output() toggleBookmark = new EventEmitter<void>();
  @Output() comment = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();
  @Output() reply = new EventEmitter<string>();
  @Output() moreOptions = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly isExpanded = signal(false);
  readonly contentLimit = CONTENT_LIMIT;

  onToggleLike(): void {
    this.toggleLike.emit();
  }

  onToggleBookmark(): void {
    this.toggleBookmark.emit();
  }

  onComment(): void {
    this.comment.emit();
  }

  onShareClick(): void {
    this.share.emit();
  }

  onReply(event: Event): void {
    const input = (event.target as HTMLInputElement);
    if (input.value.trim()) {
      this.reply.emit(input.value);
      input.value = '';
    }
  }

  onMoreOptions(): void {
    this.moreOptions.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
