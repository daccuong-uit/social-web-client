import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'lib-card',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    lib-card section {
      width: 100%;
      border-radius: 1.5rem;
      padding: 2rem;
      background: var(--color-surface-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--color-border-glass);
      box-shadow: var(--shadow-premium);
      transition: all 0.3s ease;
    }
    lib-card section:hover {
      box-shadow: 0 0 0 1px var(--color-brand-primary / 0.1), 0 20px 40px -10px var(--color-brand-primary / 0.2);
    }
  `],
  template: `
    <section>
      <ng-content />
    </section>
  `,
})
export class UiCard {}
