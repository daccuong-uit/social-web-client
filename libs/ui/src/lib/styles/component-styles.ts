/**
 * Component Styling Utilities & Mixins
 * Shared styles for common patterns (button, input, card, etc.)
 * Applies design tokens consistently across all components
 * 
 * Usage in Angular components:
 * ```
 * import { COMPONENT_STYLES } from '@fe/ui';
 * 
 * @Component({
 *   selector: 'my-button',
 *   template: `<button [ngStyle]="buttonStyle">Click me</button>`,
 *   styles: [`
 *     :host {
 *       display: inline-block;
 *     }
 *     button {
 *       ${COMPONENT_STYLES.button.base}
 *     }
 *   `]
 * })
 * ```
 */

export const COMPONENT_STYLES = {
  // ══════════════════════════════════════════════════════════════
  // Button Styles
  // ══════════════════════════════════════════════════════════════
  button: {
    base: `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: calc(var(--padding-scale, 1) * 0.5rem);
      
      padding: 0 calc(var(--padding-scale, 1) * 1rem);
      height: calc(var(--padding-scale, 1) * 2.5rem);
      min-width: 2.5rem;
      
      font-family: var(--font-family, 'Outfit', sans-serif);
      font-size: calc(var(--font-size-scale, 1) * 1rem);
      font-weight: 600;
      line-height: calc(var(--line-height, 1.5));
      
      border: 1px solid var(--color-btn-border);
      border-radius: 0.5rem;
      background-color: var(--color-btn-bg);
      color: var(--color-text-base);
      
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      white-space: nowrap;
      text-decoration: none;
      
      &:hover:not(:disabled) {
        background-color: var(--color-btn-hover);
        border-color: var(--color-btn-border-hover);
      }
      
      &:active:not(:disabled) {
        transform: scale(0.98);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      &:focus-visible {
        outline: 2px solid var(--color-brand-primary);
        outline-offset: 2px;
      }
    `,

    primary: `
      background-color: var(--color-brand-primary);
      color: white;
      border-color: var(--color-brand-primary);
      
      &:hover:not(:disabled) {
        background-color: var(--color-brand-primary-hover);
        border-color: var(--color-brand-primary-hover);
      }
    `,

    outline: `
      background-color: transparent;
      border-width: 2px;
    `,

    ghost: `
      background-color: transparent;
      border-color: transparent;
      
      &:hover:not(:disabled) {
        background-color: var(--color-surface-subtle);
      }
    `,

    icon: `
      width: calc(var(--padding-scale, 1) * 2.5rem);
      padding: 0;
    `,
  },

  // ══════════════════════════════════════════════════════════════
  // Input/Form Field Styles
  // ══════════════════════════════════════════════════════════════
  input: {
    base: `
      display: block;
      width: 100%;
      
      padding: calc(var(--padding-scale, 1) * 0.75rem) calc(var(--padding-scale, 1) * 1rem);
      height: calc(var(--padding-scale, 1) * 2.5rem);
      
      font-family: var(--font-family, 'Outfit', sans-serif);
      font-size: calc(var(--font-size-scale, 1) * 1rem);
      line-height: calc(var(--line-height, 1.5));
      
      border: 1px solid var(--color-border-subtle);
      border-radius: 0.5rem;
      background-color: var(--color-surface-subtle);
      color: var(--color-text-base);
      
      transition: all 0.15s ease-in-out;
      
      &::placeholder {
        color: var(--color-text-muted);
      }
      
      &:hover:not(:disabled) {
        border-color: var(--color-border-default);
      }
      
      &:focus {
        outline: none;
        border-color: var(--color-brand-primary);
        background-color: var(--color-surface-base);
        box-shadow: 0 0 0 3px rgba(var(--color-brand-primary), 0.1);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,

    error: `
      border-color: var(--color-danger);
      background-color: rgb(var(--color-danger) / 0.05);
      
      &:focus {
        border-color: var(--color-danger);
        box-shadow: 0 0 0 3px rgb(var(--color-danger) / 0.1);
      }
    `,

    success: `
      border-color: var(--color-success);
      background-color: rgb(var(--color-success) / 0.05);
      
      &:focus {
        border-color: var(--color-success);
        box-shadow: 0 0 0 3px rgb(var(--color-success) / 0.1);
      }
    `,
  },

  // ══════════════════════════════════════════════════════════════
  // Card/Container Styles
  // ══════════════════════════════════════════════════════════════
  card: {
    base: `
      padding: calc(var(--padding-scale, 1) * 1.5rem);
      border-radius: 1rem;
      background-color: var(--color-surface-subtle);
      border: 1px solid var(--color-border-subtle);
      transition: all 0.3s ease-in-out;
      
      &:hover {
        border-color: var(--color-border-default);
      }
    `,

    glass: `
      background: rgb(255 255 255 / 0.75);
      backdrop-filter: blur(20px);
      border: 1px solid rgb(255 255 255 / 0.3);
      box-shadow: var(--shadow-premium);
    `,

    elevated: `
      box-shadow: var(--shadow-premium);
    `,
  },

  // ══════════════════════════════════════════════════════════════
  // Text/Typography Styles
  // ══════════════════════════════════════════════════════════════
  text: {
    h1: `
      font-size: calc(var(--font-size-scale, 1) * 2rem);
      font-weight: 700;
      line-height: calc(var(--line-height, 1.5) * 1.2);
      margin: 0;
    `,

    h2: `
      font-size: calc(var(--font-size-scale, 1) * 1.75rem);
      font-weight: 700;
      line-height: calc(var(--line-height, 1.5) * 1.2);
      margin: 0;
    `,

    h3: `
      font-size: calc(var(--font-size-scale, 1) * 1.5rem);
      font-weight: 700;
      line-height: calc(var(--line-height, 1.5) * 1.2);
      margin: 0;
    `,

    body: `
      font-size: calc(var(--font-size-scale, 1) * 1rem);
      font-weight: 400;
      line-height: calc(var(--line-height, 1.5));
      margin: 0;
    `,

    caption: `
      font-size: calc(var(--font-size-scale, 1) * 0.75rem);
      font-weight: 400;
      line-height: calc(var(--line-height, 1.5));
      color: var(--color-text-muted);
      margin: 0;
    `,

    muted: `
      color: var(--color-text-muted);
    `,
  },

  // ══════════════════════════════════════════════════════════════
  // Layout Utilities
  // ══════════════════════════════════════════════════════════════
  layout: {
    flexCenter: `
      display: flex;
      align-items: center;
      justify-content: center;
    `,

    flexBetween: `
      display: flex;
      align-items: center;
      justify-content: space-between;
    `,

    gridColumns: `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: calc(var(--padding-scale, 1) * 1.5rem);
    `,

    containerMaxWidth: `
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 calc(var(--padding-scale, 1) * 1.5rem);
    `,
  },

  // ══════════════════════════════════════════════════════════════
  // Spacing Helpers
  // ══════════════════════════════════════════════════════════════
  spacing: {
    section: `padding: calc(var(--padding-scale, 1) * 2rem) 0;`,
    blockXs: `padding: calc(var(--padding-scale, 1) * 0.5rem);`,
    blockSm: `padding: calc(var(--padding-scale, 1) * 1rem);`,
    blockMd: `padding: calc(var(--padding-scale, 1) * 1.5rem);`,
    blockLg: `padding: calc(var(--padding-scale, 1) * 2rem);`,
  },
};

/**
 * CSS custom property scale calculator
 * Used for responsive component sizing based on settings
 */
export const CSS_SCALE_FORMULA = {
  fontSize: `calc(var(--font-size-scale, 1) * VALUE)`,
  padding: `calc(var(--padding-scale, 1) * VALUE)`,
  height: `calc(var(--padding-scale, 1) * VALUE)`,
  gap: `calc(var(--padding-scale, 1) * VALUE)`,
};
