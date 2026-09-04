import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, ThemeService } from '@fe/core';
import { TranslocoModule } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';
import { UiAppHeader, UiAuthFooter } from '@fe/ui';

import { RegisterSelection } from './components/register-selection.component';
import { RegisterFormEmail } from './components/register-form-email.component';

type RegisterView = 'selection' | 'email-register';

@Component({
  standalone: true,
  selector: 'feat-auth-register',
  imports: [
    CommonModule,
    TranslocoModule,
    UiAppHeader,
    UiAuthFooter,
    RegisterSelection,
    RegisterFormEmail
  ],
  template: `
    <div
      class="flex flex-col min-h-screen w-full bg-surface-base transition-colors duration-300"
      [class.light]="theme() === 'light'"
      [class.dark]="theme() === 'dark'"
      [class.ocean]="theme() === 'ocean'"
      [class.forest]="theme() === 'forest'"
      *transloco="let t"
    >
      <!-- Header -->
      <lib-ui-app-header context="register" (logoClicked)="currentView.set('selection')" />

      <!-- Main content — centered, with padding-bottom to clear fixed 2-row footer -->
      <div
        class="flex-1 flex flex-col items-center justify-center px-4"
        style="padding-top: 32px; padding-bottom: 130px;"
      >
        <div class="w-full" style="max-width: 480px; display: flex; flex-direction: column; align-items: center;">
          @if (currentView() === 'selection') {
            <feat-auth-register-selection (methodSelected)="onMethodSelected($event)" />
          } @else if (currentView() === 'email-register') {
            <feat-auth-register-form-email
              [isLoading]="isLoading"
              [fieldErrors]="fieldErrors"
              (back)="currentView.set('selection')"
              (sendOtpRequested)="onSendOtp($event)"
              (register)="onRegister($event)"
            />
          }
        </div>
      </div>

      <!-- Fixed footer -->
      <lib-ui-auth-footer context="register" />
    </div>
  `,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  currentView = signal<RegisterView>('selection');
  theme = this.themeService.theme;

  isLoading = false;
  fieldErrors: Record<string, boolean> = {};

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onMethodSelected(method: string) {
    if (method === 'email') {
      this.currentView.set('email-register');
    } else {
      toast.info(`Phương thức ${method} sẽ sớm được hỗ trợ!`);
    }
  }

  onSendOtp(phoneNumber: string) {
    this.authService.sendOtp(phoneNumber).subscribe({
      next: () => {
        toast.success(`Mã OTP đã được gửi đến số điện thoại ${phoneNumber}!`);
      },
      error: (err) => {
        toast.error('Gửi mã OTP thất bại. Vui lòng thử lại!');
      }
    });
  }

  onRegister(data: any) {
    this.fieldErrors = {};
    let isValid = true;

    if (!data.displayName || data.displayName.trim().length === 0) {
      this.fieldErrors['displayName'] = true;
      isValid = false;
    }

    if (!data.username || data.username.length < 3) {
      this.fieldErrors['username'] = true;
      isValid = false;
    }

    if (data.tab === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        this.fieldErrors['email'] = true;
        isValid = false;
      }
    } else {
      if (!data.phone) {
        this.fieldErrors['phone'] = true;
        isValid = false;
      }
      if (!data.otp) {
        this.fieldErrors['otp'] = true;
        isValid = false;
      }
    }

    if (!data.password || data.password.length < 8) {
      this.fieldErrors['password'] = true;
      isValid = false;
    }

    if (!isValid) {
      toast.error('Vui lòng kiểm tra các trường thông tin.');
      return;
    }

    this.isLoading = true;

    // Construct payload for AuthService matching standard phone/email register structure
    const payload = data.tab === 'email' ? {
      username: data.username,
      displayName: data.displayName,
      email: data.email,
      password: data.password
    } : {
      username: data.username,
      displayName: data.displayName,
      phoneNumber: data.countryCode + data.phone,
      otp: data.otp,
      password: data.password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        toast.success('Tạo tài khoản thành công!');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
