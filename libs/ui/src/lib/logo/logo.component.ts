import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'ui-logo',
  imports: [],
  template: `
    <div
      class="flex items-center gap-2 cursor-pointer"
      role="button"
      [attr.tabindex]="0"
      (click)="clicked.emit()"
      (keydown.enter)="clicked.emit()"
      (keydown.space)="clicked.emit()"
    >
      <span
        [style.width.px]="logoSize"
        [style.height.px]="logoSize"
        [style.display]="'grid'"
        [style.place-items]="'center'"
        [style.border-radius]="'50%'"
        [style.background]="'var(--color-brand-primary)'"
        [style.color]="'white'"
        [style.font-weight]="'var(--font-weight-strong)'"
        [style.user-select]="'none'"
        aria-hidden="true"
      >R</span>
      <span
        [style.font-family]="'var(--font-family)'"
        [style.font-weight]="'var(--font-weight-strong)'"
        [style.font-size]="'var(--type-body-lg)'"
        [style.letter-spacing]="'0'"
        [style.color]="'var(--color-text-base)'"
        [style.line-height]="'var(--type-leading-tight)'"
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
}
