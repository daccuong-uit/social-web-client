import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'lib-inline-loader',
  imports: [CommonModule],
  template: `
    <div class="inline-loader-panel" role="status" aria-live="polite" aria-label="{{ label }}">
      <div class="inline-loader">
        <span class="dot dot1"></span>
        <span class="dot dot2"></span>
        <span class="dot dot3"></span>
        <span class="dot dot4"></span>
        <span class="dot dot5"></span>
      </div>
    </div>
  `,
  styles: [`
    .inline-loader-panel {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      z-index: 10;
      pointer-events: all;
    }

    .inline-loader {
      position: relative;
      width: 32px;
      height: 32px;
      animation: loader-rotate 1.2s linear infinite;
    }

    .dot {
      position: absolute;
      border-radius: 999px;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
      animation: dot-pulse 1.1s ease-in-out infinite alternate;
    }

    .dot1 {
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: #7c3aed;
    }

    .dot2 {
      right: 0;
      top: 42%;
      width: 6px;
      height: 6px;
      background: #0ea5e9;
    }

    .dot3 {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: #f97316;
    }

    .dot4 {
      left: 0;
      top: 42%;
      width: 5px;
      height: 5px;
      background: #ec4899;
    }

    .dot5 {
      top: 24%;
      left: 24%;
      width: 3px;
      height: 3px;
      background: #14b8a6;
    }

    @keyframes loader-rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes dot-pulse {
      0% {
        transform: scale(0.88);
        opacity: 0.88;
      }
      100% {
        transform: scale(1.12);
        opacity: 1;
      }
    }
  `],
})
export class UiInlineLoaderComponent {
  @Input() label = 'Đang tải...';
}
