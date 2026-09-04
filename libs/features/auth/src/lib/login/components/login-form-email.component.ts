import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInlineLoaderComponent } from '@fe/ui';

@Component({
  standalone: true,
  selector: 'feat-auth-login-form-email',
  imports: [CommonModule, FormsModule, UiInlineLoaderComponent],
  styles: [`
    .form-wrap {
      width: 100%;
      max-width: 360px;
    }

    /* ── Tab bar ── */
    .tab-bar {
      display: flex;
      border-bottom: 1px solid var(--color-border-subtle);
      margin-bottom: 20px;
    }
    .tab-item {
      flex: 1;
      text-align: center;
      padding: 10px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.2s, border-color 0.2s;
      background: none;
      border-left: none;
      border-right: none;
      border-top: none;
    }
    .tab-item.active {
      color: var(--color-text-base);
      border-bottom-color: var(--color-text-base);
    }

    /* ── Inputs ── */
    .phone-row {
      display: flex;
      gap: 0;
      border: 1px solid var(--color-border-subtle);
      border-radius: 4px;
      overflow: hidden;
      background: var(--color-surface-subtle);
      margin-bottom: 8px;
    }
    .phone-country {
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-right: 1px solid var(--color-border-subtle);
      background: var(--color-surface-subtle);
      cursor: pointer;
      white-space: nowrap;
    }
    .phone-country select {
      background: transparent;
      border: none;
      outline: none;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-base);
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
    }
    .phone-input {
      flex: 1;
      padding: 0 12px;
      height: 44px;
      background: transparent;
      border: none;
      outline: none;
      font-size: 14px;
      color: var(--color-text-base);
      font-family: 'Outfit', sans-serif;
    }
    .phone-input::placeholder { color: var(--color-text-muted); }

    .otp-row {
      display: flex;
      gap: 0;
      border: 1px solid var(--color-border-subtle);
      border-radius: 4px;
      overflow: hidden;
      background: var(--color-surface-subtle);
      margin-bottom: 8px;
    }
    .otp-input {
      flex: 1;
      padding: 0 12px;
      height: 44px;
      background: transparent;
      border: none;
      outline: none;
      font-size: 14px;
      color: var(--color-text-base);
      font-family: 'Outfit', sans-serif;
    }
    .otp-input::placeholder { color: var(--color-text-muted); }
    .otp-send-btn {
      padding: 0 16px;
      height: 44px;
      background: transparent;
      border: none;
      border-left: 1px solid var(--color-border-subtle);
      color: var(--color-text-base);
      font-size: 14px;
      font-weight: 600;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      white-space: nowrap;
    }
    .otp-send-btn:hover { opacity: 0.7; }

    .text-input {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid var(--color-border-subtle);
      border-radius: 4px;
      background: var(--color-surface-subtle);
      color: var(--color-text-base);
      font-size: 14px;
      font-family: 'Outfit', sans-serif;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 8px;
    }
    .text-input::placeholder { color: var(--color-text-muted); }
    .text-input:focus { border-color: rgba(255,255,255,0.4); }

    /* ── Toggle link ── */
    .toggle-link {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-muted);
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      font-family: 'Outfit', sans-serif;
      text-align: left;
      display: block;
      margin-bottom: 16px;
    }
    .toggle-link:hover { color: var(--color-text-base); }

    /* ── Submit btn ── */
    .submit-btn {
      width: 100%;
      height: 48px;
      border-radius: 4px;
      border: none;
      font-size: var(--button-font-size, 0.8125rem);
      font-weight: var(--button-font-weight, 400);
      font-family: var(--font-family-ui, 'Inter', system-ui, sans-serif);
      cursor: pointer;
      transition: opacity 0.2s;
      background: var(--color-btn-bg);
      color: var(--color-text-muted);
      margin-top: 4px;
    }
    .submit-btn.active {
      background: #fe2c55;
      color: #fff;
    }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .form-wrap {
      position: relative;
    }

    .form-content.loading-active {
      opacity: 0.75;
      filter: blur(0.8px);
    }


    /* ── Back link ── */
    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-top: 20px;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-base);
      cursor: pointer;
      background: none;
      border: none;
      font-family: 'Outfit', sans-serif;
    }
    .back-link:hover { opacity: 0.7; }

    /* ── Error text ── */
    .error-text {
      font-size: 12px;
      color: #fe2c55;
      margin-top: 4px;
      display: block;
    }
  `],
  template: `
    <div class="form-wrap fade-in">
      <div class="form-content" [class.loading-active]="isLoading">
        <!-- Title -->
        <h1 style="font-size:1.75rem; font-weight:700; text-align:center; margin-bottom:20px; color: var(--color-text-base);">
          Đăng nhập
        </h1>

      <!-- Tab bar -->
      <div class="tab-bar">
        <button class="tab-item" [class.active]="activeTab === 'phone'" (click)="activeTab = 'phone'; resetErrors()">
          Điện thoại
        </button>
        <button class="tab-item" [class.active]="activeTab === 'email'" (click)="activeTab = 'email'; resetErrors()">
          Đăng nhập bằng email hoặc tên người dùng
        </button>
      </div>

      <!-- ── PHONE TAB ── -->
      @if (activeTab === 'phone') {
        <!-- Phone number input -->
        <div class="phone-row">
          <div class="phone-country">
            <select [(ngModel)]="countryCode" name="country">
              <option value="+84">VN +84</option>
              <option value="+1">US +1</option>
              <option value="+44">GB +44</option>
              <option value="+81">JP +81</option>
              <option value="+82">KR +82</option>
              <option value="+86">CN +86</option>
            </select>
          </div>
          <input
            class="phone-input"
            type="tel"
            placeholder="Số điện thoại"
            [(ngModel)]="credentials.phone"
            (ngModelChange)="onFieldChange('phone')"
            name="phone"
          />
        </div>
        @if (fieldErrors['phone']) {
          <span class="error-text">Vui lòng nhập số điện thoại hợp lệ</span>
        }

        <!-- OTP row -->
        @if (!usePassword) {
          <div class="otp-row">
            <input
              class="otp-input"
              type="text"
              placeholder="Nhập mã gồm 6 chữ số"
              [(ngModel)]="credentials.otp"
              (ngModelChange)="onFieldChange('otp')"
              name="otp"
              maxlength="6"
            />
            <button class="otp-send-btn" type="button" (click)="sendOtp()">
              {{ otpCountdown > 0 ? otpCountdown + 's' : 'Gửi mã' }}
            </button>
          </div>
          @if (fieldErrors['otp']) {
            <span class="error-text">Vui lòng nhập mã xác nhận</span>
          }
          <!-- Toggle to password -->
          <button class="toggle-link" type="button" (click)="usePassword = true; resetErrors()">
            Đăng nhập bằng mật khẩu
          </button>
        }

        <!-- Password (when toggled) -->
        @if (usePassword) {
          <input
            class="text-input"
            type="password"
            placeholder="Mật khẩu"
            [(ngModel)]="credentials.password"
            (ngModelChange)="onFieldChange('password')"
            name="password"
          />
          @if (fieldErrors['password']) {
            <span class="error-text">Mật khẩu là bắt buộc</span>
          }
          <button class="toggle-link" type="button" (click)="usePassword = false; resetErrors()">
            Đăng nhập bằng mã xác nhận
          </button>
        }
      }

      <!-- ── EMAIL TAB ── -->
      @if (activeTab === 'email') {
        <input
          class="text-input"
          type="text"
          placeholder="Email hoặc tên người dùng"
          [(ngModel)]="credentials.email"
          (ngModelChange)="onFieldChange('email')"
          name="email"
        />
        @if (fieldErrors['email']) {
          <span class="error-text">Vui lòng nhập email hợp lệ</span>
        }

        <input
          class="text-input"
          type="password"
          placeholder="Mật khẩu"
          [(ngModel)]="credentials.password"
          (ngModelChange)="onFieldChange('password')"
          name="password"
        />
        @if (fieldErrors['password']) {
          <span class="error-text">Mật khẩu là bắt buộc</span>
        }

        <div style="text-align:right; margin-bottom: 12px;">
          <a href="#" style="font-size:13px; font-weight:600; color: var(--color-text-muted);">Quên mật khẩu?</a>
        </div>
      }

      <ng-container *ngIf="isLoading">
        <lib-inline-loader></lib-inline-loader>
      </ng-container>

      <!-- Submit -->
      <button
        type="button"
        class="submit-btn"
        [class.active]="isFormFilled()"
        [disabled]="isLoading"
        (click)="onSubmit()"
      >
        {{ isLoading ? 'Đang xác thực...' : 'Đăng nhập' }}
      </button>

      <!-- Back -->
      <button class="back-link" type="button" (click)="back.emit()">
        <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
          <path d="M31 36L19 24L31 12" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Quay lại
      </button>
      </div>

    </div>
  `,
})
export class LoginFormEmail {
  @Input() isLoading = false;
  @Input() fieldErrors: Record<string, boolean> = {};
  @Output() login = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();
  @Output() sendOtpRequested = new EventEmitter<string>();

  activeTab: 'phone' | 'email' = 'phone';
  usePassword = false;
  countryCode = '+84';
  otpCountdown = 0;
  private otpTimer: any = null;

  credentials = {
    phone: '',
    email: '',
    password: '',
    otp: ''
  };

  resetErrors() {
    this.fieldErrors = {};
  }

  onFieldChange(field: string) {
    this.fieldErrors[field] = false;
  }

  isFormFilled(): boolean {
    if (this.activeTab === 'phone') {
      if (!this.credentials.phone) return false;
      if (this.usePassword) return !!this.credentials.password;
      return !!this.credentials.otp;
    }
    return !!this.credentials.email && !!this.credentials.password;
  }

  sendOtp() {
    if (this.otpCountdown > 0) return;
    if (!this.credentials.phone) {
      this.fieldErrors['phone'] = true;
      return;
    }
    
    const fullPhone = this.countryCode + this.credentials.phone;
    this.sendOtpRequested.emit(fullPhone);

    this.otpCountdown = 60;
    this.otpTimer = setInterval(() => {
      this.otpCountdown--;
      if (this.otpCountdown <= 0) clearInterval(this.otpTimer);
    }, 1000);
  }

  onSubmit() {
    this.login.emit({
      tab: this.activeTab,
      ...this.credentials,
      countryCode: this.countryCode,
      usePassword: this.usePassword
    });
  }
}