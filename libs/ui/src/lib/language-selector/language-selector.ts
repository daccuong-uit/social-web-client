import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'lib-language-selector',
  imports: [CommonModule],
  template: `
    <select
      [value]="currentLang()"
      (change)="changeLang($event)"
      style="
        background: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-base);
        appearance: auto;
        -webkit-appearance: auto;
        padding: 0;
      "
    >
      <option value="vi" style="background: var(--color-surface-base); color: var(--color-text-base);">Tiếng Việt</option>
      <option value="en" style="background: var(--color-surface-base); color: var(--color-text-base);">English</option>
    </select>
  `,
})
export class UiLanguageSelector {
  private translocoService = inject(TranslocoService);

  currentLang() {
    return this.translocoService.getActiveLang();
  }

  changeLang(event: Event) {
    const lang = (event.target as HTMLSelectElement).value;
    this.translocoService.setActiveLang(lang);
  }
}