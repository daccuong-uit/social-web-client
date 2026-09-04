// Test file to verify Dynamic CSS Variables System works correctly
// Place in: libs/core/src/lib/design-system/ui-settings.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { UiSettingsService } from './ui-settings.service';

describe('Dynamic CSS Variables System', () => {
  let service: UiSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UiSettingsService],
    });
    service = TestBed.inject(UiSettingsService);
  });

  describe('Typography Scaling', () => {
    it('should set --font-size-body when fontSize changes', (done) => {
      service.updateSetting('fontSize', 'large');

      // Allow time for effect() to run
      setTimeout(() => {
        const root = document.documentElement;
        const fontSizeBody = getComputedStyle(root).getPropertyValue('--font-size-body');

        // Large = 0.96 multiplier, so 15px * 0.96 = 14.4px
        expect(fontSizeBody.trim()).toBe('14.4px');
        done();
      }, 50);
    });

    it('should cascade font sizes from --font-size-body', (done) => {
      service.updateSetting('fontSize', 'xlarge');

      setTimeout(() => {
        const root = document.documentElement;
        const fontSizeBody = parseFloat(
          getComputedStyle(root).getPropertyValue('--font-size-body')
        );
        const fontSizeHeadingLg = parseFloat(
          getComputedStyle(root).getPropertyValue('--font-size-heading-lg')
        );

        // --font-size-heading-lg = calc(var(--font-size-body) + 9px)
        // If body = 16.8px, heading-lg should be ~25.8px
        expect(fontSizeHeadingLg).toBeGreaterThan(fontSizeBody);
        expect(Math.round(fontSizeHeadingLg - fontSizeBody)).toBe(9);
        done();
      }, 50);
    });
  });

  describe('Spacing Scaling', () => {
    it('should set --spacing-scale-base when paddingScale changes', (done) => {
      service.updateSetting('paddingScale', 'spacious');

      setTimeout(() => {
        const root = document.documentElement;
        const spacingBase = getComputedStyle(root).getPropertyValue('--spacing-scale-base');

        // Spacious = 1.35 multiplier, so 4px * 1.35 = 5.4px
        expect(spacingBase.trim()).toBe('5.4px');
        done();
      }, 50);
    });

    it('should cascade spacing tiers from --spacing-scale-base', (done) => {
      service.updateSetting('paddingScale', 'comfortable');

      setTimeout(() => {
        const root = document.documentElement;
        const spacingBase = parseFloat(
          getComputedStyle(root).getPropertyValue('--spacing-scale-base')
        );
        const spacing4 = parseFloat(
          getComputedStyle(root).getPropertyValue('--spacing-4')
        );

        // --spacing-4 = calc(var(--spacing-scale-base) * 4)
        // If base = 4.32px, spacing-4 should be ~17.28px
        expect(spacing4).toBeCloseTo(spacingBase * 4, 1);
        done();
      }, 50);
    });
  });

  describe('Settings Persistence', () => {
    it('should persist settings to localStorage', () => {
      service.updateSetting('fontSize', 'large');
      service.updateSetting('paddingScale', 'spacious');

      const stored = JSON.parse(localStorage.getItem('ui-settings') || '{}');
      expect(stored.fontSize).toBe('large');
      expect(stored.paddingScale).toBe('spacious');
    });

    it('should restore settings from localStorage on next service init', () => {
      service.updateSetting('fontSize', 'xlarge');

      // Create new service instance (simulating page reload)
      const newService = new UiSettingsService();
      const settings = newService.getSettings();

      expect(settings.fontSize).toBe('xlarge');
    });
  });

  describe('DOM Application', () => {
    it('should apply theme class to html element', (done) => {
      service.updateSetting('theme', 'dark');

      setTimeout(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        done();
      }, 50);
    });

    it('should toggle high-contrast class on body', (done) => {
      service.updateSetting('highContrast', true);

      setTimeout(() => {
        expect(document.body.classList.contains('high-contrast')).toBe(true);

        service.updateSetting('highContrast', false);
        setTimeout(() => {
          expect(document.body.classList.contains('high-contrast')).toBe(false);
          done();
        }, 50);
      }, 50);
    });
  });
});
