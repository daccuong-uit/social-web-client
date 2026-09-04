import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '@fe/core';
import { AuthFacade } from '../data-access/auth.facade';
import { TranslocoModule } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';
import { UiAppHeader, UiAuthFooter } from '@fe/ui';

import { LoginSelection } from './components/login-selection.component';
import { LoginFormEmail } from './components/login-form-email.component';

type LoginView = 'selection' | 'email-login';

@Component({
  standalone: true,
  selector: 'feat-auth-login',
  imports: [
    CommonModule,
    TranslocoModule,
    UiAppHeader,
    UiAuthFooter,
    LoginSelection,
    LoginFormEmail
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
      <lib-ui-app-header context="login" (logoClicked)="currentView.set('selection')" />

      <!-- Main content — centered, with padding-bottom to clear fixed 2-row footer -->
      <div
        class="flex-1 flex flex-col items-center justify-center px-4"
        style="padding-top: 32px; padding-bottom: 130px;"
      >
        <div class="w-full" style="max-width: 480px; display: flex; flex-direction: column; align-items: center;">
          @if (currentView() === 'selection') {
            <feat-auth-login-selection (methodSelected)="onMethodSelected($event)" />
          } @else if (currentView() === 'email-login') {
            <feat-auth-login-form-email
              [isLoading]="authFacade.isSubmitting$()"
              [fieldErrors]="fieldErrors"
              (back)="currentView.set('selection')"
              (sendOtpRequested)="onSendOtp($event)"
              (login)="onLogin($event)"
            />
          }
        </div>
      </div>

      <!-- Fixed footer -->
      <lib-ui-auth-footer context="login" />
    </div>
  `,
})
export class LoginComponent {
  private themeService = inject(ThemeService);
  private router = inject(Router);
  protected authFacade = inject(AuthFacade);

  currentView = signal<LoginView>('selection');
  theme = this.themeService.theme;

  fieldErrors: Record<string, boolean> = {};

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onMethodSelected(method: string) {
    if (method === 'email') {
      this.currentView.set('email-login');
    } else {
      toast.info(`Phương thức ${method} sẽ sớm được hỗ trợ!`);
    }
  }

  onSendOtp(phoneNumber: string) {
    this.authFacade.sendOtp(phoneNumber).subscribe({
      next: () => {
        toast.success(`Mã OTP đã được gửi đến số điện thoại ${phoneNumber}!`);
      },
      error: () => {
        // Toast already shown by the global error interceptor — no duplicate needed.
      }
    });
  }

  onLogin(credentials: any) {
    this.fieldErrors = {};
    let isValid = true;
    let payload: Record<string, any> = {};

    if (credentials.tab === 'email') {
      if (!credentials.email) {
        this.fieldErrors['email'] = true;
        isValid = false;
      }
      if (!credentials.password) {
        this.fieldErrors['password'] = true;
        isValid = false;
      }
      payload = {
        email: credentials.email,
        password: credentials.password
      };
    } else {
      // Phone tab
      if (!credentials.phone) {
        this.fieldErrors['phone'] = true;
        isValid = false;
      }
      if (credentials.usePassword) {
        if (!credentials.password) {
          this.fieldErrors['password'] = true;
          isValid = false;
        }
        payload = {
          phoneNumber: credentials.countryCode + credentials.phone,
          password: credentials.password
        };
      } else {
        if (!credentials.otp) {
          this.fieldErrors['otp'] = true;
          isValid = false;
        }
        payload = {
          phoneNumber: credentials.countryCode + credentials.phone,
          otp: credentials.otp
        };
      }
    }

    if (!isValid) {
      toast.error('Vui lòng kiểm tra các trường thông tin.');
      return;
    }

    this.authFacade.login(payload).subscribe({
      next: () => {
        toast.success('Đăng nhập thành công!');
        this.router.navigate(['/home']);
      },
      error: () => {
        // Toast already shown by the global error interceptor — no duplicate needed.
      }
    });
  }
}