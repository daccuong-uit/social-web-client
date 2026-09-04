import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

/**
 * Skeleton loader for list/table items
 * Shows realistic loading state for data grids
 */
@Component({
  standalone: true,
  selector: 'lib-skeleton-list',
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="skeleton-list">
      @for (item of items; track $index) {
        <div class="skeleton-list__item">
          @for (col of columns; track col) {
            <div class="skeleton-list__col">
              <lib-skeleton variant="text" [width]="colWidths[col] || 80" />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skeleton-list__item {
      display: grid;
      grid-template-columns: repeat(var(--cols, 3), 1fr);
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: rgba(0, 0, 0, 0.02);
    }

    .skeleton-list__col {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  `],
})
export class SkeletonListComponent {
  @Input() itemCount = 5;
  @Input() columns = ['col1', 'col2', 'col3'];
  @Input() colWidths: Record<string, number> = {};

  get items() {
    return Array.from({ length: this.itemCount });
  }
}
