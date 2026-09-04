import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'lib-action-button',
  imports: [CommonModule],
  template: `
    <button class="tiktok-btn" (click)="clicked.emit()">
      <span class="tiktok-btn-icon">
        <ng-content select="[icon]" />
      </span>
      <span class="flex-1 text-center">
        <ng-content />
      </span>
    </button>
  `,
})
export class UiActionButton {
  @Output() clicked = new EventEmitter<void>();
}