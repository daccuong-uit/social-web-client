import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable skeleton loader component
 * Provides smooth loading states without spinner abuse
 * Supports various shapes and sizes
 */
@Component({
  standalone: true,
  selector: 'lib-skeleton',
  imports: [CommonModule],
  template: `
    <div
      class="skeleton"
      [class.skeleton--text]="variant === 'text'"
      [class.skeleton--circle]="variant === 'circle'"
      [class.skeleton--rect]="variant === 'rect'"
      [class.skeleton--card]="variant === 'card'"
      [style.width.%]="width"
      [style.height.rem]="height"
    ></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.06) 25%,
        rgba(0, 0, 0, 0.1) 50%,
        rgba(0, 0, 0, 0.06) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
      border-radius: 0.25rem;
    }

    .skeleton--text {
      height: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 0.25rem;
    }

    .skeleton--circle {
      border-radius: 50%;
      width: 2.5rem;
      height: 2.5rem;
    }

    .skeleton--rect {
      border-radius: 0.5rem;
      aspect-ratio: 16 / 9;
    }

    .skeleton--card {
      border-radius: 0.5rem;
      padding: 1rem;
      background-color: rgba(0, 0, 0, 0.02);
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: calc(200% + 200px) 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
        background: rgba(0, 0, 0, 0.06);
      }
    }
  `],
})
export class SkeletonComponent {
  @Input() variant: 'text' | 'circle' | 'rect' | 'card' = 'text';
  @Input() width = 100;
  @Input() height = 1;
}
