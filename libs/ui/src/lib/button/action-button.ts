import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'lib-action-button',
  imports: [CommonModule],
  template: `
    <button class="tiktok-btn" [class.loading]="loading" [disabled]="disabled" (click)="clicked.emit()">
      @if (loading) {
        <span class="ui-button__spinner" aria-hidden="true"></span>
      }
      <span class="tiktok-btn-icon" [class.hidden]="loading">
        <ng-content select="[icon]" />
      </span>
      <span class="ui-button__content">
        <ng-content />
      </span>
    </button>
  `,
})
export class UiActionButton {
  @Input() disabled = false;
  @Input() loading = false;
  @Output() clicked = new EventEmitter<void>();
}