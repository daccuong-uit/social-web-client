/**
 * @fileoverview Follow Button Component
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn"
      [class.btn-outline]="!isFollowing"
      [class.btn-primary]="isFollowing"
      [class.following]="isFollowing"
      (click)="onToggleFollow()"
      [disabled]="isLoading"
    >
      <span class="button-text">{{ isFollowing ? 'Following' : 'Follow' }}</span>
    </button>
  `,
  styles: [
    `
      .btn {
        display: inline-flex;
        width: 100%;
      }
      .following:hover:not(:disabled) {
        background-color: rgba(29, 155, 240, 0.06);
        border-color: var(--color-brand-primary, #1d9bf0);
        color: var(--color-brand-primary, #1d9bf0);
      }
      .button-text {
        display: block;
      }
    `,
  ],
})
export class FollowButtonComponent implements OnInit {
  @Input() isFollowing = false;
  @Input() isLoading = false;
  @Output() toggleFollow = new EventEmitter<void>();

  ngOnInit(): void {
    // Initialize if needed
  }

  onToggleFollow(): void {
    this.toggleFollow.emit();
  }
}
