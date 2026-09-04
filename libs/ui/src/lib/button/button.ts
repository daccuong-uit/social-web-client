import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'lib-button',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    lib-button {
      display: inline-block;
      min-width: fit-content;
    }

    lib-button button,
    button.btn,
    .btn,
    .option-btn,
    .reset-btn,
    .preview-btn,
    button.create-button,
    button.post-btn,
    button.profile-actions,
    .profile-actions button,
    .profile-edit-btn button,
    button.promo-card button,
    button.placeholder-card button,
    button.action-btn,
    button.compose-input,
    button.show-more,
    .show-more,
    a.inline-flex {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--button-height, calc(var(--padding-scale, 1) * 1.75rem));
      box-sizing: border-box;
      border-radius: var(--button-radius, calc(var(--padding-scale, 1) * 0.375rem));
      padding: var(--button-padding-y, calc(var(--padding-scale, 1) * 0.375rem)) var(--button-padding-x, calc(var(--padding-scale, 1) * 0.75rem));
      font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      font-size: var(--font-size-caption);
      font-weight: var(--button-font-weight, 400);
      line-height: 1;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: 1px solid transparent;
      white-space: nowrap;
      gap: 0.3rem;
      box-shadow: none;
      text-decoration: none;
    }

    lib-button button {
      width: 100%;
    }

    /* ─── Type 1: Primary ─────────────────────────────────────── */
    lib-button button.primary,
    button.btn.primary,
    button.btn-primary,
    .btn-primary,
    .preview-btn.primary,
    .profile-actions button.primary-action,
    button.primary {
      background-color: var(--color-brand-primary, #1d9bf0);
      color: var(--color-text-inverse, #ffffff);
      border-color: var(--color-brand-primary, #1d9bf0);
      box-shadow: 0 2px 6px rgba(29, 155, 240, 0.2);
    }

    lib-button button.primary:hover:not(:disabled),
    button.btn.primary:hover:not(:disabled),
    button.btn-primary:hover:not(:disabled),
    .btn-primary:hover:not(:disabled),
    .preview-btn.primary:hover:not(:disabled),
    .profile-actions button.primary-action:hover:not(:disabled),
    button.primary:hover:not(:disabled) {
      background-color: var(--color-brand-primary-hover, #1a8cd8);
      border-color: var(--color-brand-primary-hover, #1a8cd8);
      box-shadow: 0 4px 12px rgba(29, 155, 240, 0.28);
    }

    /* ─── Type 2: Outline / Secondary ──────────────────────────── */
    lib-button button.outline,
    button.btn.outline,
    button.btn-outline,
    .btn-outline,
    .option-btn,
    .create-button,
    .profile-actions button:not(.primary-action),
    .profile-edit-btn button,
    .reset-btn {
      background-color: var(--color-surface-base, #ffffff);
      border-color: var(--color-border-subtle, #cbd5e1);
      color: var(--color-text-base, #0f172a);
      box-shadow: none;
    }

    lib-button button.outline:hover:not(:disabled),
    button.btn.outline:hover:not(:disabled),
    button.btn-outline:hover:not(:disabled),
    .btn-outline:hover:not(:disabled),
    .option-btn:hover:not(:disabled),
    .create-button:hover:not(:disabled),
    .profile-actions button:not(.primary-action):hover:not(:disabled),
    .profile-edit-btn button:hover:not(:disabled),
    .reset-btn:hover:not(:disabled) {
      background-color: var(--color-surface-subtle, #f1f5f9);
      border-color: var(--color-border-strong, #94a3b8);
    }

    /* ─── Type 3: Ghost / Text ─────────────────────────────────── */
    lib-button button.ghost,
    button.btn.ghost,
    button.btn-ghost,
    .btn-ghost,
    .btn-accent,
    .reset-btn.ghost {
      background-color: transparent;
      border: 1px solid currentColor;
      color: var(--color-brand-primary, #1d9bf0);
      box-shadow: none;
    }

    lib-button button.ghost:hover:not(:disabled),
    button.btn.ghost:hover:not(:disabled),
    button.btn-ghost:hover:not(:disabled),
    .btn-ghost:hover:not(:disabled),
    .btn-accent:hover:not(:disabled),
    .reset-btn.ghost:hover:not(:disabled) {
      background-color: rgba(29, 155, 240, 0.08);
      border-color: currentColor;
    }

    /* Active & Disabled states */
    lib-button button:active:not(:disabled),
    button.btn:active:not(:disabled),
    .btn:active:not(:disabled) {
      transform: scale(0.98);
    }

    lib-button button:disabled,
    button.btn:disabled,
    .btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      filter: grayscale(0.25);
      transform: none;
    }
  `],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="variant"
    >
      <ng-content />
    </button>
  `,
})
/**
 * `UiButton` — Standardized Button Component for the UI Library.
 * 
 * Supports 3 unified variants with standardized height (1.625rem), compact padding (0.15rem 0.5rem),
 * border-radius (0.5rem), font-size (0.875rem), and 500 font weight:
 * - `primary`: High-contrast solid brand action button.
 * - `outline`: Clean surface button with subtle border.
 * - `ghost`: Transparent accent/text button.
 * 
 * @example
 * ```html
 * <lib-button variant="primary">Submit</lib-button>
 * <lib-button variant="outline">Cancel</lib-button>
 * <lib-button variant="ghost">Learn More</lib-button>
 * ```
 */
export class UiButton {
  /** Standard HTML button element type */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** Visual variant type: 'primary' | 'outline' | 'ghost' */
  @Input() variant: 'primary' | 'outline' | 'ghost' = 'primary';

  /** Disabled state boolean */
  @Input() disabled = false;
}
