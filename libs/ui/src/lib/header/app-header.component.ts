import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../logo/logo.component';

export type HeaderContext = 'login' | 'register' | 'dashboard' | 'default';

@Component({
  standalone: true,
  selector: 'lib-ui-app-header',
  imports: [CommonModule, LogoComponent],
  template: `
    <div class="flex items-center justify-between px-6 py-4 md:px-10 md:py-5 bg-surface-base">
      <!-- Logo -->
      <ui-logo (clicked)="logoClicked.emit()"></ui-logo>

      <!-- Right Section: Feedback link (only for auth pages) -->
      <div class="flex items-center gap-4">
        @if (showFeedback) {
          <a href="https://www.tiktok.com/feedback" target="_blank" class="flex items-center gap-2 text-sm font-semibold text-text-base hover:underline">
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
              <path d="M24 19V13" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M24 35V27" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Phản hồi và trợ giúp
          </a>
        }
      </div>
    </div>
  `,
})
export class UiAppHeader {
  @Input() context: HeaderContext = 'default';
  @Output() logoClicked = new EventEmitter<void>();

  get showFeedback(): boolean {
    return this.context === 'login' || this.context === 'register';
  }
}
