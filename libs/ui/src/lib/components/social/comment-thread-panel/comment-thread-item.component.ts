import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Comment } from '@fe/domain/social';

@Component({
  selector: 'lib-comment-thread-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comment-node" [class.is-child]="level > 0">
      <div class="comment-card">
        <img [src]="comment.author.avatar" [alt]="comment.author.fullName" class="comment-avatar" />
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-author">{{ comment.author.fullName }}</span>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
          <div class="comment-actions">
            <button type="button" class="action-link like-action" (click)="toggleLike.emit(comment.id)">
              <span class="heart-icon" [class.is-liked]="comment.isLiked">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 20.25c-1.06-1.1-4.5-3.88-6.66-6.48A5.34 5.34 0 0 1 12 6.75a5.34 5.34 0 0 1 6.66 6.99c-2.16 2.6-5.6 5.38-6.66 6.51Z"/>
                </svg>
              </span>
              <span class="like-count">{{ comment.likesCount || 0 }}</span>
            </button>
            <button type="button" class="action-link" (click)="replyToComment.emit({ id: comment.id, authorName: comment.author.fullName })">Phản hồi</button>
          </div>
        </div>
      </div>

      <div class="reply-list" *ngIf="comment.replies.length">
        <lib-comment-thread-item
          *ngFor="let reply of comment.replies; trackBy: trackComment"
          [comment]="reply"
          [level]="level + 1"
          (toggleLike)="toggleLike.emit($event)"
          (replyToComment)="replyToComment.emit($event)"
        ></lib-comment-thread-item>
      </div>
    </div>
  `,
  styles: [
    `
      .comment-node {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .comment-node.is-child {
        margin-left: 16px;
        padding-left: 10px;
        border-left: 2px solid #e2e8f0;
      }
      .comment-card {
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }
      .comment-avatar {
        width: 36px;
        height: 36px;
        border-radius: 999px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .comment-body {
        flex: 1;
        min-width: 0;
      }
      .comment-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .comment-author {
        font-weight: 700;
        color: #111827;
        font-size: 14px;
      }
      .comment-time {
        color: #94a3b8;
        font-size: 12px;
      }
      .comment-content {
        margin: 0;
        color: #334155;
        font-size: 14px;
        line-height: 1.5;
      }
      .comment-actions {
        display: flex;
        gap: 10px;
        margin-top: 6px;
      }
      .action-link {
        background: none;
        border: none;
        color: #2563eb;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
      }
      .like-action {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #64748b;
      }
      .heart-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
      }
      .heart-icon svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }
      .heart-icon.is-liked {
        color: #ef4444;
      }
      .like-count {
        font-size: 12px;
        line-height: 1;
        color: inherit;
      }
      .comment-stats {
        font-size: 12px;
        color: #64748b;
      }
      .reply-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    `,
  ],
})
export class CommentThreadItemComponent {
  @Input() comment!: Comment;
  @Input() level = 0;
  @Output() toggleLike = new EventEmitter<string>();
  @Output() replyToComment = new EventEmitter<{ id: string; authorName: string }>();

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

  trackComment(_: number, item: Comment): string {
    return item.id;
  }
}
