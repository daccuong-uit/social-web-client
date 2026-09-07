/**
 * Design System: Typography, Spacing, Colors, Border Radius
 * Single source of truth for all component sizing & styling
 * Last updated: 2025-05-22
 * 
 * USAGE in components:
 * - import { DESIGN_TOKENS } from '@fe/core';
 * - Use in styles: [styles: [`color: var(${DesignTokens.color.text.base});`]]
 */

export const DesignTokens = {
  // ═══════════════════════════════════════════════════════════════
  // Typography: one family, eight sizes, three weights
  // ═══════════════════════════════════════════════════════════════
  typography: {
    family: "'Outfit', sans-serif",
    size: {
      micro: 'var(--type-micro)',
      caption: 'var(--type-caption)',
      small: 'var(--type-small)',
      body: 'var(--type-body)',
      bodyLarge: 'var(--type-body-lg)',
      heading: 'var(--type-heading)',
      title: 'var(--type-title)',
      display: 'var(--type-display)',
    },
    weight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // Line Heights (for text readability)
  // ═══════════════════════════════════════════════════════════════
  lineHeight: {
    tight: 1.2,       // Headlines (h1-h3)
    normal: 1.5,      // Body text, buttons
    relaxed: 1.75,    // Long-form content, paragraphs
    loose: 2,         // Extra space for readability
  },

  // ═══════════════════════════════════════════════════════════════
  // Spacing Scale (4px base = 0.25rem)
  // 8px base scale for consistency
  // ═══════════════════════════════════════════════════════════════
  spacing: {
    // Logical names
    xs: '0.25rem',    // 4px  - minimal gaps
    sm: '0.5rem',     // 8px  - small gaps, icon margins
    md: '0.75rem',    // 12px - component padding
    lg: '1rem',       // 16px - standard padding
    xl: '1.5rem',     // 24px - section padding
    xxl: '2rem',      // 32px - large section padding
    huge: '2.5rem',   // 40px - very large padding
    massive: '3rem',  // 48px - page-level padding
    
    // Direct pixel values for reference
    px: {
      4: '0.25rem',
      8: '0.5rem',
      12: '0.75rem',
      16: '1rem',
      24: '1.5rem',
      32: '2rem',
      40: '2.5rem',
      48: '3rem',
      56: '3.5rem',
      64: '4rem',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // Border Radius (consistent rounding)
  // ═══════════════════════════════════════════════════════════════
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px  - subtle rounding
    md: '0.5rem',     // 8px  - standard rounding
    lg: '1rem',       // 16px - rounded containers
    xl: '1.5rem',     // 24px - large buttons, modals
    full: '9999px',   // fully rounded (circles, pills)
  },

  // ═══════════════════════════════════════════════════════════════
  // Component Sizes (standardized dimensions)
  // ═══════════════════════════════════════════════════════════════
  componentSize: {
    // Button sizes (height)
    button: {
      xs: '1.75rem',   // 28px - small buttons, icon buttons
      sm: '2rem',      // 32px - compact buttons
      md: '2.5rem',    // 40px - standard button (most common)
      lg: '3rem',      // 48px - large button
      xl: '3.5rem',    // 56px - CTA button
    },
    // Input/Form field sizes (height)
    input: {
      sm: '2rem',      // 32px - compact input
      md: '2.5rem',    // 40px - standard input
      lg: '3rem',      // 48px - large input
    },
    // Icon sizes
    icon: {
      xs: '1rem',      // 16px - small icons in text
      sm: '1.5rem',    // 24px - standard icon (in buttons)
      md: '2rem',      // 32px - large icon
      lg: '2.5rem',    // 40px - very large icon
      xl: '3rem',      // 48px - hero icon
    },
    // Avatar/Profile sizes
    avatar: {
      xs: '1.5rem',    // 24px - tiny avatar
      sm: '2rem',      // 32px - small avatar in list
      md: '2.5rem',    // 40px - standard avatar
      lg: '3rem',      // 48px - large avatar in profile
      xl: '4rem',      // 64px - hero avatar
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // Layout Dimensions (page & container sizes)
  // ═══════════════════════════════════════════════════════════════
  layout: {
    // Page margins/padding
    pageMargin: '1.5rem',  // 24px - side margins on mobile
    pageMaxWidth: '1200px', // 1200px - max content width
    
    // Sidebar
    sidebarWidth: '15rem',   // 240px - navigation sidebar
    sidebarWidthMobile: '14rem', // 224px - mobile sidebar
    
    // Header/Footer
    headerHeight: '3.75rem',     // 60px - main header
    headerHeightCompact: '3rem', // 48px - compact header
    footerHeight: '4rem',        // 64px - main footer
    
    // Card/Section
    cardPadding: '1.5rem',   // 24px - standard card padding
    cardPaddingLarge: '2rem', // 32px - large card padding
  },

  // ═══════════════════════════════════════════════════════════════
  // Color Tokens (CSS variable names)
  // Maps to variables defined in styles.css
  // ═══════════════════════════════════════════════════════════════
  color: {
    // Brand colors
    primary: 'var(--color-brand-primary)',
    primaryHover: 'var(--color-brand-primary-hover)',
    
    // Surface colors (backgrounds)
    surface: {
      base: 'var(--color-surface-base)',
      subtle: 'var(--color-surface-subtle)',
      card: 'var(--color-surface-card, var(--color-surface-subtle))',
    },
    
    // Text colors
    text: {
      base: 'var(--color-text-base)',
      muted: 'var(--color-text-muted)',
      inverse: 'var(--color-text-inverse, var(--color-text-base))',
    },
    
    // Border colors
    border: {
      subtle: 'var(--color-border-subtle)',
      default: 'var(--color-border-default, rgba(0,0,0,0.12))',
      hover: 'var(--color-border-hover, rgba(0,0,0,0.2))',
    },
    
    // Semantic colors
    status: {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      danger: 'var(--color-danger)',
      info: 'var(--color-info)',
    },
    
    // Button colors
    button: {
      bg: 'var(--color-btn-bg)',
      bgHover: 'var(--color-btn-hover)',
      border: 'var(--color-btn-border)',
      borderHover: 'var(--color-btn-border-hover)',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // Shadows & Effects
  // ═══════════════════════════════════════════════════════════════
  shadow: {
    premium: 'var(--shadow-premium)',
    glow: 'var(--shadow-glow)',
  },

  // ═══════════════════════════════════════════════════════════════
  // Z-Index Scale (stacking context)
  // ═══════════════════════════════════════════════════════════════
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    notification: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // Transitions & Animations
  // ═══════════════════════════════════════════════════════════════
  transition: {
    duration: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s',
    },
    timing: 'ease-in-out',
  },

  // ═══════════════════════════════════════════════════════════════
  // Breakpoints (responsive design)
  // ═══════════════════════════════════════════════════════════════
  breakpoint: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
} as const;

/**
 * Utility: Generate CSS custom property string
 * Usage: getCSSVar('color', 'text', 'base') → var(--color-text-base)
 */
export function getCSSVar(...args: string[]): string {
  return `var(--${args.join('-')})`;
}

/**
 * Utility: Generate inline style object from design tokens
 * Usage: getInlineStyle({ padding: spacing.lg, fontSize: fontSize.body.md })
 */
export type DesignTokenValue = string | number;
export function getInlineStyle(
  tokens: Record<string, DesignTokenValue>
): Record<string, string> {
  return Object.entries(tokens).reduce(
    (acc, [key, value]) => {
      acc[key] = typeof value === 'number' ? `${value}px` : String(value);
      return acc;
    },
    {} as Record<string, string>
  );
}
