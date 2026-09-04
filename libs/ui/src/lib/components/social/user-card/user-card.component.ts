/**
 * @fileoverview User Card Component
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '@fe/domain/social';
import { FollowButtonComponent } from '../follow-button/follow-button.component';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, FollowButtonComponent],
  template: `
    <div class="user-card" *ngIf="user">
      <div class="card-header">
        <img [src]="user.avatar" [alt]="user.fullName" class="avatar" />
        <div class="user-info">
          <h3 class="fullname">{{ user.fullName }}</h3>
          <p class="username">@{{ user.username }}</p>
        </div>
        <app-follow-button
          [isFollowing]="user.isFollowing"
          [isLoading]="isFollowLoading"
          (toggleFollow)="onToggleFollow()"
        />
      </div>

      <p class="bio" *ngIf="user.bio">{{ user.bio }}</p>

      <div class="stats">
        <div class="stat">
          <span class="stat-count">{{ user.followers }}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat">
          <span class="stat-count">{{ user.following }}</span>
          <span class="stat-label">Following</span>
        </div>
        <div class="stat">
          <span class="stat-count">{{ user.postsCount }}</span>
          <span class="stat-label">Posts</span>
        </div>
      </div>

      <div class="actions" *ngIf="showActions">
        <button class="action-btn" (click)="onViewProfile()">View Profile</button>
        <button class="action-btn secondary" (click)="onMessage()">Message</button>
      </div>
    </div>
  `,
  styles: [
    `
      .user-card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 16px;
        transition: all 0.2s ease;

        &:hover {
          border-color: #0066cc;
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.1);
        }
      }

      .card-header {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        align-items: flex-start;
      }

      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .user-info {
        flex: 1;
        min-width: 0;
      }

      .fullname {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: #000;
      }

      .username {
        margin: 2px 0 0 0;
        font-size: 13px;
        color: #666;
      }

      .bio {
        margin: 12px 0;
        font-size: 14px;
        color: #555;
        line-height: 1.4;
      }

      .stats {
        display: flex;
        gap: 16px;
        margin: 12px 0;
        padding: 12px 0;
        border-top: 1px solid #f0f0f0;
        border-bottom: 1px solid #f0f0f0;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat-count {
        font-weight: 700;
        font-size: 16px;
        color: #000;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }

      .actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .action-btn {
        flex: 1;
        padding: 8px 12px;
        border-radius: 20px;
        border: 1px solid #e0e0e0;
        background: #fff;
        color: #000;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;

        &:hover {
          background: #f5f5f5;
        }

        &.secondary {
          border-color: #0066cc;
          color: #0066cc;
          background: #f0f7ff;

          &:hover {
            background: #e0f0ff;
          }
        }
      }
    `,
  ],
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() showActions = true;
  @Input() isFollowLoading = false;
  @Output() toggleFollow = new EventEmitter<void>();
  @Output() viewProfile = new EventEmitter<void>();
  @Output() message = new EventEmitter<void>();

  onToggleFollow(): void {
    this.toggleFollow.emit();
  }

  onViewProfile(): void {
    this.viewProfile.emit();
  }

  onMessage(): void {
    this.message.emit();
  }
}
