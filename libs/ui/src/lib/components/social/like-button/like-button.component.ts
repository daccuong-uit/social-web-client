/**
 * @fileoverview Like Button Component
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-like-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="like-button-container">
      <button
        class="like-button"
        [class.liked]="isLiked"
        (click)="onToggleLike()"
        [disabled]="isLoading"
        [attr.aria-label]="isLiked ? 'Unlike' : 'Like'"
      >
        <span class="heart-icon" [class.animate]="animateLike">❤️</span>
      </button>
      <span class="like-count" *ngIf="showCount">{{ likesCount }}</span>
    </div>
  `,
  styles: [
    `
      .like-button-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .like-button {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        font-size: 20px;
        transition: transform 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover:not(:disabled) {
          transform: scale(1.1);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .heart-icon {
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          filter: grayscale(100%);
        }

        &.liked .heart-icon {
          filter: grayscale(0%);
          animation: heartBeat 0.4s ease;
        }

        &.liked:hover {
          transform: scale(1.15);
        }
      }

      .like-count {
        font-size: 14px;
        color: #666;
        font-weight: var(--font-weight-regular, 500);
      }

      @keyframes heartBeat {
        0%,
        100% {
          transform: scale(1);
        }
        15% {
          transform: scale(1.3);
        }
        30% {
          transform: scale(1);
        }
      }

      @keyframes animate {
        0% {
          transform: scale(0.8) rotate(0deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.2) rotate(-10deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }

      .heart-icon.animate {
        animation: animate 0.5s ease;
      }
    `,
  ],
})
export class LikeButtonComponent {
  @Input() isLiked = false;
  @Input() likesCount = 0;
  @Input() isLoading = false;
  @Input() showCount = true;
  @Output() toggleLike = new EventEmitter<void>();

  animateLike = false;

  onToggleLike(): void {
    this.animateLike = true;
    setTimeout(() => {
      this.animateLike = false;
    }, 500);

    this.toggleLike.emit();
  }
}
