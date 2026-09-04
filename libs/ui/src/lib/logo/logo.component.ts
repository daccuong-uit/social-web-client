import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ASSETS_CONFIG } from '@fe/core';

@Component({
  standalone: true,
  selector: 'ui-logo',
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center gap-2 cursor-pointer"
      role="button"
      [attr.tabindex]="0"
      (click)="clicked.emit()"
      (keydown.enter)="clicked.emit()"
      (keydown.space)="clicked.emit()"
    >
      <img
        [src]="logoSrc"
        [alt]="logoAlt"
        [width]="logoSize"
        [height]="logoSize"
        class="object-contain"
      />
      <span
        [style.font-family]="'Syne, sans-serif'"
        [style.font-weight]="700"
        [style.font-size.px]="fontSize"
        [style.letter-spacing.px]="letterSpacing"
        [style.color]="'var(--color-text-base)'"
        [style.line-height]="1"
        [style.user-select]="'none'"
      >
        REALS
      </span>
    </div>
  `,
})
export class LogoComponent {
  @Output() clicked = new EventEmitter<void>();
  @Input() logoSize = 40;
  @Input() fontSize = 20;
  @Input() letterSpacing = 1.5;

  logoSrc = ASSETS_CONFIG.images.logo.main;
  logoAlt = ASSETS_CONFIG.images.logo.alt;
}
