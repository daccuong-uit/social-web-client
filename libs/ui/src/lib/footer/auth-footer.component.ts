import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiLanguageSelector } from '../language-selector/language-selector';
import { ThemeService, Theme, Font } from '@fe/core';

export type AuthContext = 'login' | 'register';

@Component({
  standalone: true,
  selector: 'lib-ui-auth-footer',
  imports: [CommonModule, UiLanguageSelector, RouterModule],
  template: `
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-surface-base border-t border-border-subtle">
      <!-- Row 1: Navigation link (Register/Login) -->
      <div class="w-full py-4 flex justify-center items-center text-sm">
        <span style="color: var(--color-text-muted);">
          {{ context === 'login' ? 'Bạn không có tài khoản?' : 'Bạn đã có tài khoản?' }}
        </span>
        <a 
          [routerLink]="context === 'login' ? '/auth/register' : '/auth/login'" 
          class="ml-1 font-bold hover:underline" 
          style="color: #fe2c55;"
        >
          {{ context === 'login' ? 'Đăng ký' : 'Đăng nhập' }}
        </a>
      </div>

      <!-- Row 2: Language + Theme + Font (left) | copyright (right) -->
      <div class="px-6 pb-5 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <!-- Language selector -->
          <lib-language-selector />

          @if (context !== 'login' && context !== 'register') {
            <!-- Theme selector dropdown -->
            <div class="flex items-center gap-1">
              <span style="font-size: 14px;">🎨</span>
              <select
                [value]="currentTheme()"
                (change)="changeTheme($event)"
                style="
                  background: transparent;
                  border: none;
                  outline: none;
                  cursor: pointer;
                  font-family: inherit;
                  font-size: 14px;
                  font-weight: 600;
                  color: var(--color-text-base);
                  appearance: auto;
                  -webkit-appearance: auto;
                  padding: 0;
                "
              >
                <option value="light" style="background: var(--color-surface-base); color: var(--color-text-base);">Chế độ sáng</option>
                <option value="dark" style="background: var(--color-surface-base); color: var(--color-text-base);">Chế độ tối</option>
                <option value="ocean" style="background: var(--color-surface-base); color: var(--color-text-base);">Đại dương</option>
                <option value="forest" style="background: var(--color-surface-base); color: var(--color-text-base);">Rừng thông</option>
              </select>
            </div>

            <!-- Font selector dropdown -->
            <div class="flex items-center gap-1">
              <span style="font-size: 14px;">🔤</span>
              <select
                [value]="currentFont()"
                (change)="changeFont($event)"
                style="
                  background: transparent;
                  border: none;
                  outline: none;
                  cursor: pointer;
                  font-family: inherit;
                  font-size: 14px;
                  font-weight: 600;
                  color: var(--color-text-base);
                  appearance: auto;
                  -webkit-appearance: auto;
                  padding: 0;
                "
              >
                <option value="Outfit" style="background: var(--color-surface-base); color: var(--color-text-base);">Outfit (Mặc định)</option>
                <option value="Inter" style="background: var(--color-surface-base); color: var(--color-text-base);">Inter</option>
                <option value="Syne" style="background: var(--color-surface-base); color: var(--color-text-base);">Syne</option>
                <option value="Playfair Display" style="background: var(--color-surface-base); color: var(--color-text-base);">Playfair</option>
              </select>
            </div>
          }
        </div>

        <div class="text-xs font-normal" style="color: var(--color-text-muted); opacity: 0.7;">© 2026 Reals</div>
      </div>
    </div>
  `,
})
export class UiAuthFooter {
  @Input() context: AuthContext = 'login';

  private themeService = inject(ThemeService);

  currentTheme = this.themeService.theme;
  currentFont = this.themeService.font;

  changeTheme(event: Event) {
    const val = (event.target as HTMLSelectElement).value as Theme;
    this.themeService.setTheme(val);
  }

  changeFont(event: Event) {
    const val = (event.target as HTMLSelectElement).value as Font;
    this.themeService.setFont(val);
  }
}
