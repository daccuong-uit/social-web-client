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

    :root {
      --button-height: 2rem;
      --button-min-width: 5rem;
      --button-padding-inline: 0.75rem;
      --button-gap: 0.5rem;
      --button-group-gap: 0.5rem;
      --button-radius: 0.375rem;
      --button-font-size: var(--type-small);
      --button-font-weight: var(--font-weight-medium);
      --button-focus-ring: 0 0 0 3px rgb(42 171 238 / 0.28);
      --button-transition: 160ms cubic-bezier(0.2, 0, 0, 1);
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
      width: auto;
      min-width: var(--button-min-width);
      height: var(--button-height);
      min-height: var(--button-height);
      box-sizing: border-box;
      border-radius: 8px;
      padding: 0 var(--button-padding-inline);
      font-family: var(--font-family);
      font-size: var(--button-font-size);
      font-weight: var(--button-font-weight);
      line-height: 1;
      transition: background-color var(--button-transition), border-color var(--button-transition), box-shadow var(--button-transition), transform var(--button-transition), color var(--button-transition);
      cursor: pointer;
      border: 1px solid transparent;
      white-space: nowrap;
      gap: var(--button-gap);
      box-shadow: none;
      text-decoration: none;
      margin: 0;
    }

    :where(.profile-actions, .button-group, .btn-group, .actions) {
      display: flex;
      align-items: center;
      gap: var(--button-group-gap);
    }

    :where(.profile-actions, .button-group, .btn-group, .actions) > lib-button {
      margin: 0;
    }

    lib-button button > .ui-button__content,
    button.btn > .ui-button__content,
    .btn > .ui-button__content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: inherit;
      min-width: 0;
      line-height: 1;
    }

    lib-button button svg,
    lib-button button img,
    button.btn svg,
    button.btn img,
    .btn svg,
    .btn img {
      display: block;
      flex: 0 0 auto;
      width: 1.125rem;
      height: 1.125rem;
      object-fit: cover;
      aspect-ratio: 1;
    }

    lib-button button.icon-only,
    button.btn.icon-only,
    .btn.icon-only,
    button.btn:has(> svg:only-child),
    button.btn:has(> img:only-child),
    .btn:has(> svg:only-child),
    .btn:has(> img:only-child),
    .profile-actions button:has(> svg:only-child),
    .profile-actions button:has(> img:only-child) {
      width: var(--button-height);
      min-width: var(--button-height);
      padding: 0;
      border-radius: 8px;
    }

    lib-button button:focus-visible,
    button.btn:focus-visible,
    .btn:focus-visible,
    .option-btn:focus-visible,
    .reset-btn:focus-visible,
    .preview-btn:focus-visible {
      outline: 2px solid var(--color-brand-primary);
      outline-offset: 2px;
      box-shadow: var(--button-focus-ring);
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

    lib-button button.danger,
    button.btn-danger,
    .btn-danger {
      background-color: var(--color-danger);
      border-color: var(--color-danger);
      color: var(--color-text-inverse, #fff);
    }

    lib-button button.link,
    button.btn-link,
    .btn-link {
      min-width: 0;
      background: transparent;
      border-color: transparent;
      color: var(--color-brand-primary);
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }

    /* Active & Disabled states */
    lib-button button:active:not(:disabled),
    button.btn:active:not(:disabled),
    .btn:active:not(:disabled) {
      transform: scale(0.98);
    }

    lib-button button.loading,
    button.btn.loading,
    .btn.loading {
      cursor: wait;
      pointer-events: none;
    }

    .ui-button__spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 8px;
      animation: ui-button-spin 600ms linear infinite;
    }

    @keyframes ui-button-spin {
      to { transform: rotate(360deg); }
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
      [disabled]="disabled || loading"
      [class]="variant + (iconOnly ? ' icon-only' : '') + (loading ? ' loading' : '')"
      [attr.aria-busy]="loading"
      [attr.aria-label]="ariaLabel || null"
    >
      @if (loading) {
        <span class="ui-button__spinner" aria-hidden="true"></span>
      }
      <span class="ui-button__content"><ng-content /></span>
    </button>
  `,
})
/**
 * `UiButton` — Standardized Button Component for the UI Library.
 * 
 * Supports unified dimensions and variants with aligned icon/image content:
 * - `primary`: High-contrast solid brand action button.
 * - `outline`: Clean surface button with subtle border.
 * - `ghost`: Transparent accent/text button.
 * - `danger`: Destructive solid action.
 * - `link`: Text-only action.
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

  /** Visual treatment only; dimensions remain shared across variants. */
  @Input() variant: 'primary' | 'outline' | 'ghost' | 'danger' | 'link' = 'primary';

  /** Disabled state boolean */
  @Input() disabled = false;

  /** Replaces projected content with a consistent spinner while preserving button width. */
  @Input() loading = false;

  /** Accessible name for icon-only buttons. */
  @Input() ariaLabel = '';

  /** Makes the button a compact square icon-only control. */
  @Input() iconOnly = false;
}
