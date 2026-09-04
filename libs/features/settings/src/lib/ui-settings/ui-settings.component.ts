/**
 * UI Settings Component
 * Allows users to customize font, size, padding, and theme globally
 * Settings sync across all pages and persist in localStorage
 */

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiSettingsService, type UiSettings } from '@fe/core';

@Component({
  selector: 'app-ui-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ui-settings-container">
      <h2 class="settings-title">Appearance & Layout</h2>
      <p class="settings-note">Standardize app-wide typography for Home, Dashboard, Profile, Media and Manage account screens from one central settings panel.</p>
      
      <!-- Typography Settings -->
      <div class="settings-section">
        <h3 class="section-title">Typography</h3>
        
        <!-- Font Family -->
        <div class="setting-item">
          <label class="setting-label">Font Family</label>
          <div class="setting-options">
            <button 
              *ngFor="let font of fontFamilyOptions"
              [class.active]="fontFamily$() === font.value"
              (click)="updateFontFamily(font.value)"
              class="option-btn"
              [style.fontFamily]="font.style"
            >
              {{ font.label }}
            </button>
          </div>
        </div>

        <!-- Font Size -->
        <div class="setting-item">
          <label class="setting-label">Font Size</label>
          <div class="setting-options">
            <button 
              *ngFor="let size of fontSizeOptions"
              [class.active]="fontSize$() === size.value"
              (click)="updateFontSize(size.value)"
              class="option-btn"
            >
              {{ size.label }} ({{ size.preview }})
            </button>
          </div>
        </div>

        <!-- Line Height -->
        <div class="setting-item">
          <label class="setting-label">Line Height</label>
          <div class="setting-options">
            <button 
              *ngFor="let height of lineHeightOptions"
              [class.active]="lineHeight$() === height.value"
              (click)="updateLineHeight(height.value)"
              class="option-btn"
            >
              {{ height.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Spacing Settings -->
      <div class="settings-section">
        <h3 class="section-title">Spacing & Layout</h3>
        
        <div class="setting-item">
          <label class="setting-label">Padding Scale</label>
          <div class="setting-options">
            <button 
              *ngFor="let padding of paddingScaleOptions"
              [class.active]="paddingScale$() === padding.value"
              (click)="updatePaddingScale(padding.value)"
              class="option-btn"
            >
              {{ padding.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Theme Settings -->
      <div class="settings-section">
        <h3 class="section-title">Theme</h3>
        
        <!-- Theme Selection -->
        <div class="setting-item">
          <label class="setting-label">Color Theme</label>
          <div class="setting-options">
            <button 
              *ngFor="let themeOption of themeOptions"
              [class.active]="theme$() === themeOption.value"
              (click)="updateTheme(themeOption.value)"
              class="option-btn theme-btn"
            >
              <span class="theme-preview" [style.backgroundColor]="themeOption.color"></span>
              {{ themeOption.label }}
            </button>
          </div>
        </div>

        <!-- Accessibility -->
        <div class="setting-item">
          <label class="setting-label">Accessibility</label>
          <div class="accessibility-options">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [checked]="highContrast$()"
                (change)="toggleHighContrast()"
              >
              <span>High Contrast Mode</span>
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [checked]="reducedMotion$()"
                (change)="toggleReducedMotion()"
              >
              <span>Reduce Motion</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="settings-actions">
        <button 
          (click)="resetToDefaults()"
          class="reset-btn"
        >
          Reset to Defaults
        </button>
      </div>

      <!-- Preview -->
      <div class="preview-section">
        <h3 class="section-title">Preview</h3>
        <div class="preview-card">
          <p class="preview-text-lg">Large Text</p>
          <p class="preview-text-md">Medium Text</p>
          <p class="preview-text-sm">Small Text</p>
          <button class="preview-btn">Sample Button</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ui-settings-container {
      max-width: 900px;
      margin: 0;
      padding: 0;
    }

    .settings-title {
      font-size: var(--font-size-subtitle);
      font-weight: var(--button-font-weight, 500);
      margin: 0 0 0.5rem 0;
      color: var(--color-text-base);
    }

    .settings-note {
      font-size: calc(var(--font-size-scale, 1) * 0.8rem);
      line-height: 1.65;
      margin: 0 0 1.3rem 0;
      color: var(--color-text-muted);
      max-width: 42rem;
    }

    .settings-section {
      margin-bottom: 2.5rem;
      padding: calc(var(--padding-scale, 1) * 1rem) 0;
    }

    .section-title {
      font-size: var(--font-size-subtitle);
      font-weight: var(--font-weight-medium, 600);
      margin: 0 0 1.5rem 0;
      color: var(--color-text-base);
    }

    .setting-item {
      margin-bottom: 1.5rem;
    }

    .setting-item:last-child {
      margin-bottom: 0;
    }

    .setting-label {
      display: block;
      font-size: calc(var(--font-size-scale, 1) * 0.875rem);
      font-weight: var(--font-weight-medium, 600);
      margin-bottom: 0.75rem;
      color: var(--color-text-base);
    }

    .setting-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .option-btn {
      height: var(--button-height, calc(var(--padding-scale, 1) * 1.625rem));
      min-height: var(--button-height, calc(var(--padding-scale, 1) * 1.625rem));
      padding: var(--button-padding-y, calc(var(--padding-scale, 1) * 0.15rem)) var(--button-padding-x, calc(var(--padding-scale, 1) * 0.5rem));
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--button-radius, calc(var(--padding-scale, 1) * 0.375rem));
      background-color: var(--color-surface-base);
      color: var(--color-text-base);
      font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      font-size: var(--button-font-size, calc(var(--font-size-scale, 1) * 0.8125rem));
      font-weight: var(--button-font-weight, 400);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      box-shadow: none;
    }

    .option-btn:hover {
      border-color: var(--color-border-subtle);
      background-color: var(--color-surface-subtle);
    }

    .option-btn.active {
      background-color: var(--color-brand-primary);
      color: var(--color-text-inverse, #ffffff);
      border-color: var(--color-brand-primary);
    }
    .reset-btn,
    .preview-btn {
      height: var(--button-height, calc(var(--padding-scale, 1) * 1.625rem));
      min-height: var(--button-height, calc(var(--padding-scale, 1) * 1.625rem));
      padding: var(--button-padding-y, calc(var(--padding-scale, 1) * 0.15rem)) var(--button-padding-x, calc(var(--padding-scale, 1) * 0.5rem));
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--button-radius, calc(var(--padding-scale, 1) * 0.375rem));
      background-color: var(--color-surface-base);
      color: var(--color-text-base);
      font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      font-size: var(--button-font-size, calc(var(--font-size-scale, 1) * 0.8125rem));
      font-weight: var(--button-font-weight, 400);
      cursor: pointer;
      box-shadow: none;
    }

    .reset-btn:hover,
    .preview-btn:hover {
      background-color: var(--color-surface-subtle);
    }
    .theme-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .theme-preview {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .accessibility-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-size: calc(var(--font-size-scale, 1) * 0.875rem);
      color: var(--color-text-base);
    }

    .checkbox-label input[type="checkbox"] {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }

    .settings-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .reset-btn {
      padding: var(--button-padding-y, calc(var(--padding-scale, 1) * 0.15rem)) var(--button-padding-x, calc(var(--padding-scale, 1) * 0.5rem));
      background-color: transparent;
      color: var(--color-brand-primary);
      border: 1px solid currentColor;
      border-radius: var(--button-radius, calc(var(--padding-scale, 1) * 0.375rem));
      font-size: var(--button-font-size, calc(var(--font-size-scale, 1) * 0.8125rem));
      font-weight: var(--button-font-weight, 400);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }

    .reset-btn:hover {
      background-color: var(--color-btn-hover);
    }

    .preview-section {
      margin-top: 2.5rem;
      padding: calc(var(--padding-scale, 1) * 1rem) 0;
    }

    .preview-card {
      padding: calc(var(--padding-scale, 1) * 1.5rem);
      background-color: var(--color-surface-base);
      border-radius: 0.5rem;
      border: 1px solid var(--color-border-subtle);
    }

    .preview-text-lg {
      font-size: calc(var(--font-size-scale, 1) * 1.5rem);
      font-weight: var(--font-weight-medium, 600);
      margin: 0 0 1rem 0;
    }

    .preview-text-md {
      font-size: calc(var(--font-size-scale, 1) * 1rem);
      font-weight: 400;
      margin: 0 0 0.75rem 0;
    }

    .preview-text-sm {
      font-size: calc(var(--font-size-scale, 1) * 0.875rem);
      font-weight: 400;
      margin: 0 0 1.5rem 0;
      color: var(--color-text-muted);
    }

    .preview-btn {
      padding: var(--button-padding-y, calc(var(--padding-scale, 1) * 0.15rem)) var(--button-padding-x, calc(var(--padding-scale, 1) * 0.5rem));
      background-color: var(--color-brand-primary);
      color: var(--color-text-inverse, #ffffff);
      border: 1px solid var(--color-brand-primary);
      border-radius: var(--button-radius, calc(var(--padding-scale, 1) * 0.375rem));
      font-size: var(--button-font-size, calc(var(--font-size-scale, 1) * 0.8125rem));
      font-weight: var(--button-font-weight, 400);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }

    .preview-btn:hover {
      background-color: var(--color-brand-primary-hover);
    }
  `]
})
export class UiSettingsComponent {
  private settingsService = inject(UiSettingsService);

  // ══════════════════════════════════════════════════════════════
  // Signal Selectors
  // ══════════════════════════════════════════════════════════════
  fontFamily$ = this.settingsService.fontFamily$;
  fontSize$ = this.settingsService.fontSize$;
  lineHeight$ = this.settingsService.lineHeight$;
  paddingScale$ = this.settingsService.paddingScale$;
  theme$ = this.settingsService.theme$;
  highContrast$ = this.settingsService.highContrast$;
  reducedMotion$ = this.settingsService.reducedMotion$;

  // ══════════════════════════════════════════════════════════════
  // Options for UI
  // ══════════════════════════════════════════════════════════════
  fontFamilyOptions = [
    { value: 'ui' as const, label: 'Outfit', style: "'Outfit', sans-serif" },
    { value: 'heading' as const, label: 'Syne', style: "'Syne', sans-serif" },
    { value: 'body' as const, label: 'Inter', style: "'Inter', sans-serif" },
    { value: 'display' as const, label: 'Playfair', style: "'Playfair Display', serif" },
    { value: 'roboto' as const, label: 'Roboto', style: "'Roboto', sans-serif" },
    { value: 'nunito' as const, label: 'Nunito', style: "'Nunito', sans-serif" },
    { value: 'montserrat' as const, label: 'Montserrat', style: "'Montserrat', sans-serif" },
  ];

  fontSizeOptions = [
    { value: 'compact' as const, label: 'Compact', preview: '-20%' },
    { value: 'normal' as const, label: 'Normal', preview: '100%' },
    { value: 'large' as const, label: 'Large', preview: '+20%' },
    { value: 'xlarge' as const, label: 'X-Large', preview: '+40%' },
  ];

  lineHeightOptions = [
    { value: 'tight' as const, label: 'Tight (1.2)' },
    { value: 'normal' as const, label: 'Normal (1.5)' },
    { value: 'relaxed' as const, label: 'Relaxed (1.75)' },
    { value: 'loose' as const, label: 'Loose (2)' },
  ];

  paddingScaleOptions = [
    { value: 'compact' as const, label: 'Compact (-20%)' },
    { value: 'normal' as const, label: 'Normal' },
    { value: 'comfortable' as const, label: 'Comfortable (+20%)' },
    { value: 'spacious' as const, label: 'Spacious (+50%)' },
  ];

  themeOptions = [
    { value: 'light' as const, label: 'Light', color: '#ffffff' },
    { value: 'dark' as const, label: 'Dark', color: '#121212' },
    { value: 'ocean' as const, label: 'Ocean', color: '#0f1c30' },
    { value: 'forest' as const, label: 'Forest', color: '#0e1d15' },
  ];

  // ══════════════════════════════════════════════════════════════
  // Event Handlers
  // ══════════════════════════════════════════════════════════════
  updateFontFamily(value: UiSettings['fontFamily']): void {
    this.settingsService.updateSetting('fontFamily', value);
  }

  updateFontSize(value: UiSettings['fontSize']): void {
    this.settingsService.updateSetting('fontSize', value);
  }

  updateLineHeight(value: UiSettings['lineHeight']): void {
    this.settingsService.updateSetting('lineHeight', value);
  }

  updatePaddingScale(value: UiSettings['paddingScale']): void {
    this.settingsService.updateSetting('paddingScale', value);
  }

  updateTheme(value: UiSettings['theme']): void {
    this.settingsService.updateSetting('theme', value);
  }

  toggleHighContrast(): void {
    const current = this.highContrast$();
    this.settingsService.updateSetting('highContrast', !current);
  }

  toggleReducedMotion(): void {
    const current = this.reducedMotion$();
    this.settingsService.updateSetting('reducedMotion', !current);
  }

  resetToDefaults(): void {
    this.settingsService.resetToDefaults();
  }
}
