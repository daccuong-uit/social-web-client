/**
 * UI Settings Service
 * Manages application-wide UI settings: font family, font size, padding scale
 * Single source of truth for visual configuration
 * 
 * Settings persist in localStorage and apply globally via CSS variables
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import { DesignTokens } from './design-tokens';

export interface UiSettings {
  // Typography
  fontFamily: 'ui' | 'body' | 'heading' | 'display' | 'roboto' | 'nunito' | 'montserrat';
  fontSize: 'compact' | 'normal' | 'large' | 'xlarge';    // Scale multiplier
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';

  // Spacing
  paddingScale: 'compact' | 'normal' | 'comfortable' | 'spacious'; // Scale multiplier

  // Appearance
  theme: 'light' | 'dark' | 'ocean' | 'forest';
  highContrast: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_UI_SETTINGS: UiSettings = {
  fontFamily: 'ui',
  fontSize: 'normal',
  lineHeight: 'normal',
  paddingScale: 'normal',
  theme: 'light',
  highContrast: false,
  reducedMotion: false,
};

// Font size multipliers (relative to base)
const FONT_SIZE_SCALES: Record<UiSettings['fontSize'], number> = {
  compact: 0.8,
  normal: 1,
  large: 1.2,
  xlarge: 1.4,
};

// Padding scale multipliers (relative to base)
const PADDING_SCALES: Record<UiSettings['paddingScale'], number> = {
  compact: 0.8,
  normal: 1,
  comfortable: 1.2,
  spacious: 1.5,
};

@Injectable({ providedIn: 'root' })
export class UiSettingsService {
  // ══════════════════════════════════════════════════════════════
  // Settings State (Signals for reactivity)
  // ══════════════════════════════════════════════════════════════
  private settings$ = signal<UiSettings>(this.loadSettings());

  // Public selectors
  fontFamily$ = computed(() => this.settings$().fontFamily);
  fontSize$ = computed(() => this.settings$().fontSize);
  lineHeight$ = computed(() => this.settings$().lineHeight);
  paddingScale$ = computed(() => this.settings$().paddingScale);
  theme$ = computed(() => this.settings$().theme);
  highContrast$ = computed(() => this.settings$().highContrast);
  reducedMotion$ = computed(() => this.settings$().reducedMotion);

  // ══════════════════════════════════════════════════════════════
  // Computed CSS Values (for component use)
  // ══════════════════════════════════════════════════════════════
  fontSizeMultiplier$ = computed(() => FONT_SIZE_SCALES[this.fontSize$()]);
  paddingMultiplier$ = computed(() => PADDING_SCALES[this.paddingScale$()]);

  // ══════════════════════════════════════════════════════════════
  // Constructor with Side Effects
  // ══════════════════════════════════════════════════════════════
  constructor() {
    // Apply settings to DOM whenever they change
    effect(() => {
      this.applySettingsToDOM(this.settings$());
    });

  }

  // ══════════════════════════════════════════════════════════════
  // Public Methods: Get/Set Settings
  // ══════════════════════════════════════════════════════════════

  /**
   * Get current settings (copy to prevent mutation)
   */
  getSettings(): UiSettings {
    return { ...this.settings$() };
  }

  /**
   * Update single setting
   */
  updateSetting<K extends keyof UiSettings>(key: K, value: UiSettings[K]): void {
    this.settings$.update(s => ({ ...s, [key]: value }));
    this.saveSettings();
  }

  /**
   * Update multiple settings at once
   */
  updateSettings(partial: Partial<UiSettings>): void {
    this.settings$.update(s => ({ ...s, ...partial }));
    this.saveSettings();
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings$.set(DEFAULT_UI_SETTINGS);
    this.saveSettings();
  }

  // ══════════════════════════════════════════════════════════════
  // Utility Methods: Generate CSS Values
  // ══════════════════════════════════════════════════════════════

  /**
   * Get scaled font size based on current setting
   * Usage: service.getScaledFontSize('1rem') → '1.15rem'
   */
  getScaledFontSize(baseSize: string): string {
    const multiplier = this.fontSizeMultiplier$();
    const baseValue = parseFloat(baseSize);
    return `${baseValue * multiplier}rem`;
  }

  /**
   * Get scaled padding based on current setting
   * Usage: service.getScaledPadding('1rem') → '1.2rem'
   */
  getScaledPadding(basePadding: string): string {
    const multiplier = this.paddingMultiplier$();
    const baseValue = parseFloat(basePadding);
    return `${baseValue * multiplier}rem`;
  }

  /**
   * Get font family value
   */
  getFontFamily(): string {
    return DesignTokens.typography.fontFamily[this.fontFamily$()];
  }

  /**
   * Get line height value
   */
  getLineHeight(): number {
    return DesignTokens.lineHeight[this.lineHeight$()];
  }

  /**
   * Get theme class name
   */
  getThemeClass(): string {
    const theme = this.theme$();
    return theme === 'light' ? '' : theme; // 'light' is default, no class needed
  }

  // ══════════════════════════════════════════════════════════════
  // Private Methods: DOM & Storage
  // ══════════════════════════════════════════════════════════════

  /**
   * Apply settings to DOM (document root)
   * 
   * This is the core method that propagates user settings to CSS variables.
   * When typography or spacing scale changes, all dependent sizes automatically adjust.
   * 
   * ▌ Dynamic Typography System ▌
   * - Base font size: 15px (--font-size-body)
   * - Multiplied by user's font size scale (0.64 → 1.12)
   * - All other sizes (sm, lg, heading-lg, etc.) scale proportionally using calc()
   * 
   * ▌ Dynamic Spacing System ▌
   * - Base spacing unit: 4px (--spacing-scale-base)
   * - Multiplied by user's padding scale (0.63 → 1.35)
   * - All spacing tiers (--spacing-1 to --spacing-24) scale using calc() multipliers
   */
  private applySettingsToDOM(settings: UiSettings): void {
    const root = document.documentElement;

    // ══════════════════════════════════════════════════════════════
    // 1. FONT FAMILY & LINE HEIGHT (non-scaling)
    // ══════════════════════════════════════════════════════════════
    root.style.setProperty('--font-family', this.getFontFamily());
    root.style.setProperty('--line-height', String(this.getLineHeight()));

    // ══════════════════════════════════════════════════════════════
    // 2. TYPOGRAPHY SCALING
    // ══════════════════════════════════════════════════════════════
    const fontScale = FONT_SIZE_SCALES[settings.fontSize];
    const BASE_FONT_SIZE = 18; // pixels (from user requirements, new normal)
    const scaledFontSizeBody = BASE_FONT_SIZE * fontScale;

    // Set legacy scaling factor (for backward compatibility with existing calc() expressions)
    root.style.setProperty('--font-size-scale', String(fontScale));

    // Set the DYNAMIC base font size (this cascades to all other font sizes)
    root.style.setProperty('--font-size-body', `${scaledFontSizeBody}px`);

    // All other font sizes (--font-size-sm, --font-size-heading-lg, etc.)
    // will automatically scale because they use calc() with --font-size-body
    // Example: --font-size-sm: calc(var(--font-size-body) - 2px)
    //   When --font-size-body = 12px, --font-size-sm = 10px
    //   When --font-size-body = 18px, --font-size-sm = 16px

    // ══════════════════════════════════════════════════════════════
    // 3. SPACING SCALING
    // ══════════════════════════════════════════════════════════════
    const paddingScale = PADDING_SCALES[settings.paddingScale];
    const BASE_SPACING = 4.4; // pixels (base unit scaled up)
    const scaledSpacingBase = BASE_SPACING * paddingScale;

    // Set legacy scaling factor (for backward compatibility)
    root.style.setProperty('--padding-scale', String(paddingScale));

    // Set the DYNAMIC base spacing unit (this cascades to all spacing tiers)
    root.style.setProperty('--spacing-scale-base', `${scaledSpacingBase}px`);

    // All spacing tiers (--spacing-1 to --spacing-24) will automatically scale
    // because they use calc() with --spacing-scale-base
    // Example: --spacing-4: calc(var(--spacing-scale-base) * 4)
    //   When --spacing-scale-base = 3px, --spacing-4 = 12px
    //   When --spacing-scale-base = 5.4px, --spacing-4 = 21.6px

    // ══════════════════════════════════════════════════════════════
    // 4. THEME & ACCESSIBILITY
    // ══════════════════════════════════════════════════════════════
    document.documentElement.className = this.getThemeClass();
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('reduce-motion', settings.reducedMotion);
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): UiSettings {
    try {
      const stored = localStorage.getItem('ui-settings');
      if (stored) {
        return { ...DEFAULT_UI_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load UI settings from localStorage', error);
    }
    return DEFAULT_UI_SETTINGS;
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('ui-settings', JSON.stringify(this.settings$()));
    } catch (error) {
      console.warn('Failed to save UI settings to localStorage', error);
    }
  }
}
