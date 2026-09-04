import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

/**
 * Skeleton loader for card layout
 * Shows header + content placeholder
 */
@Component({
  standalone: true,
  selector: 'lib-skeleton-card',
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="skeleton-card">
      <!-- Header area -->
      @if (showHeader) {
        <div class="skeleton-card__header">
          <lib-skeleton variant="circle" />
          <div class="skeleton-card__header-content">
            <lib-skeleton variant="text" [width]="60" [height]="0.875" />
            <lib-skeleton variant="text" [width]="40" [height]="0.75" />
          </div>
        </div>
      }

      <!-- Content lines -->
      <div class="skeleton-card__content">
        @for (i of contentLines; track $index) {
          <lib-skeleton variant="text" [width]="$index === contentLines.length - 1 ? 80 : 100" />
        }
      </div>

      <!-- Footer area -->
      @if (showFooter) {
        <div class="skeleton-card__footer">
          <lib-skeleton variant="text" [width]="30" [height]="2.25" />
          <lib-skeleton variant="text" [width]="25" [height]="2.25" />
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 0.5rem;
      background-color: rgba(0, 0, 0, 0.02);
    }

    .skeleton-card__header {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .skeleton-card__header-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-card__content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-card__footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }
  `],
})
export class SkeletonCardComponent {
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() lines = 3;

  get contentLines(): number[] {
    return Array.from({ length: this.lines }, (_, index) => index);
  }
}