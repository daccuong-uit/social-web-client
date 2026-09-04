import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'fe-stories-right-sidebar',
  template: `
    <div class="sidebar-right">
      <p class="sidebar-hint">Nội dung Stories sidebar.</p>
    </div>
  `,
  styles: [`
    .sidebar-right {
      padding: 16px 8px;
    }
    .sidebar-hint {
      color: var(--color-text-muted);
      font-size: var(--font-size-caption);
    }
  `]
})
export class StoriesRightSidebarComponent { }