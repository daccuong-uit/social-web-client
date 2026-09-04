/**
 * @fileoverview Comment Section Component
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '@fe/domain/social';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comment-section">
      <!-- Add Comment Input -->
      <div class="add-comment">
        <img src="https://i.pravatar.cc/150?img=12" alt="You" class="user-avatar" />
        <div class="input-wrapper">
          <input
            type="text"
            class="comment-input"
            placeholder="Add a comment..."
            [(ngModel)]="newCommentText"
            (keyup.enter)="onPostComment()"
          />
          <button
            class="post-btn"
            [disabled]="!newCommentText.trim()"
            (click)="onPostComment()"
          >
            Post
          </button>
        </div>
      </div>

      <!-- Comments List -->
      <div class="comments-list">
        <div class="comment-item" *ngFor="let comment of comments">
          <img [src]="comment.author.avatar" [alt]="comment.author.fullName" class="avatar" />
          <div class="comment-content">
            <div class="comment-header">
              <span class="author-name">{{ comment.author.fullName }}</span>
              <span class="author-username">@{{ comment.author.username }}</span>
              <span class="time">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>

            <div class="comment-actions">
              <button class="action-btn" (click)="onToggleLike(comment.id)">
                <span class="icon">{{ comment.isLiked ? '❤️' : '🤍' }}</span>
                <span *ngIf="comment.likesCount > 0">{{ comment.likesCount }}</span>
              </button>
              <button class="action-btn" (click)="onReply(comment.id)">
                <span class="icon">💬</span>
                <span>Reply</span>
              </button>
              <button class="action-btn" *ngIf="isOwnComment(comment.id)" (click)="onDeleteComment(comment.id)">
                <span class="icon">🗑️</span>
                <span>Delete</span>
              </button>
            </div>

            <!-- Replies -->
            <div class="replies" *ngIf="comment.replies && comment.replies.length > 0">
              <div class="reply-item" *ngFor="let reply of comment.replies">
                <img [src]="reply.author.avatar" [alt]="reply.author.fullName" class="reply-avatar" />
                <div class="reply-content">
                  <div class="reply-header">
                    <span class="author-name">{{ reply.author.fullName }}</span>
                    <span class="author-username">@{{ reply.author.username }}</span>
                  </div>
                  <p class="reply-text">{{ reply.content }}</p>
                  <div class="reply-actions">
                    <button class="action-btn sm" (click)="onToggleLike(reply.id)">
                      <span class="icon">{{ reply.isLiked ? '❤️' : '🤍' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <button class="load-more" *ngIf="hasMoreComments" (click)="onLoadMore()">
        Load more comments
      </button>
    </div>
  `,
  styles: [
    `
      .comment-section {
        padding: 16px 0;
        border-top: 1px solid #f0f0f0;
      }

      .add-comment {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .input-wrapper {
        flex: 1;
        display: flex;
        gap: 8px;
      }

      .comment-input {
        flex: 1;
        border: 1px solid #e0e0e0;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: #0066cc;
        }
      }

      .post-btn {
        padding: 8px 20px;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 20px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover:not(:disabled) {
          background: #0052a3;
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .comment-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f9f9f9;
        transition: background 0.2s ease;

        &:hover {
          background: #f0f0f0;
        }
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .comment-content {
        flex: 1;
        min-width: 0;
      }

      .comment-header {
        display: flex;
        gap: 8px;
        font-size: 13px;
        margin-bottom: 4px;
      }

      .author-name {
        font-weight: 700;
        color: #000;
      }

      .author-username {
        color: #666;
      }

      .time {
        color: #999;
        margin-left: auto;
      }

      .comment-text {
        margin: 0;
        font-size: 14px;
        color: #000;
        line-height: 1.4;
      }

      .comment-actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;
      }

      .action-btn {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
        transition: color 0.2s ease;

        &:hover {
          color: #0066cc;
        }

        .icon {
          font-size: 14px;
        }

        &.sm {
          font-size: 11px;

          .icon {
            font-size: 12px;
          }
        }
      }

      .replies {
        margin-top: 12px;
        padding-left: 12px;
        border-left: 2px solid #e0e0e0;
      }

      .reply-item {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .reply-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .reply-content {
        flex: 1;
        font-size: 13px;
      }

      .reply-header {
        display: flex;
        gap: 6px;
        margin-bottom: 2px;
      }

      .reply-header .author-name {
        font-weight: 700;
        font-size: 12px;
      }

      .reply-header .author-username {
        font-size: 12px;
      }

      .reply-text {
        margin: 0;
        font-size: 13px;
        color: #000;
      }

      .reply-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      .load-more {
        width: 100%;
        padding: 12px;
        background: #f5f5f5;
        border: none;
        border-radius: 8px;
        color: #0066cc;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: #e8e8e8;
        }
      }
    `,
  ],
})
export class CommentSectionComponent implements OnInit {
  @Input() comments: Comment[] = [];
  @Input() hasMoreComments = false;
  @Output() postComment = new EventEmitter<string>();
  @Output() deleteComment = new EventEmitter<string>();
  @Output() toggleLike = new EventEmitter<string>();
  @Output() replyToComment = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();

  newCommentText = '';

  ngOnInit(): void {
    // Initialize if needed
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;

    return new Date(date).toLocaleDateString();
  }

  onPostComment(): void {
    if (this.newCommentText.trim()) {
      this.postComment.emit(this.newCommentText);
      this.newCommentText = '';
    }
  }

  onDeleteComment(commentId: string): void {
    if (confirm('Delete this comment?')) {
      this.deleteComment.emit(commentId);
    }
  }

  onToggleLike(commentId: string): void {
    this.toggleLike.emit(commentId);
  }

  onReply(commentId: string): void {
    this.replyToComment.emit(commentId);
  }

  onLoadMore(): void {
    this.loadMore.emit();
  }

  isOwnComment(commentId: string): boolean {
    // Mock: check if comment author is current user
    // In Phase 5B, this would use actual user service
    return true;
  }
}
