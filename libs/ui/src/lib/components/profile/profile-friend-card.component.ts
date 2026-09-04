import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButton } from '../../button/button';
import { ProfileFriend } from '@fe/domain/profile';

@Component({
  selector: 'app-profile-friend-card',
  standalone: true,
  imports: [CommonModule, UiButton],
  template: `
    <article class="profile-card friend-card">
      <div class="status-dot" [class.online]="friend.isOnline"></div>
      
      <div class="friend-card-top">
        <div class="friend-avatar">
          <img [src]="friend.avatarUrl" [alt]="friend.displayName" />
        </div>
        <div class="friend-name-info">
          <h3>{{ friend.displayName }}</h3>
          <p class="profile-card-meta">@{{ friend.username }}</p>
        </div>
      </div>

      <div class="friend-card-middle" *ngIf="friend.mutualFriends">
        <p class="friend-subtitle">{{ friend.mutualFriends }} bạn chung</p>
      </div>

      <div class="friend-card-actions">
        <lib-button variant="outline">Xem Profile</lib-button>
        <lib-button variant="primary">Nhắn tin</lib-button>
      </div>
    </article>
  `,
  styles: [`
    .profile-card {
      position: relative;
      padding: var(--spacing-4);
      border-radius: 8px;
      background: var(--color-surface-base);
      border: 1px solid var(--color-border-subtle);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      max-width: 360px;
    }

    .friend-card-top {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .friend-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid var(--color-border-subtle);
      background: var(--color-surface-subtle);
    }

    .friend-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .friend-name-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 48px;
    }

    h3 {
      margin: 0;
      font-size: var(--font-size-body);
      font-weight: 700;
      color: var(--color-text-base);
      line-height: 1.2;
    }

    .profile-card-meta {
      margin: 0;
      font-size: var(--font-size-caption);
      color: var(--color-text-muted);
      line-height: 1.2;
    }

    .friend-card-middle {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .friend-subtitle {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .status-dot {
      position: absolute;
      top: var(--spacing-4);
      right: var(--spacing-4);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #94a3b8;
    }
    .status-dot.online {
      background: #22c55e;
    }

    .friend-card-actions {
      display: flex;
      gap: var(--spacing-3);
      justify-content: flex-start;
    }
  `],
})
export class ProfileFriendCardComponent {
  @Input() friend!: ProfileFriend;
}
