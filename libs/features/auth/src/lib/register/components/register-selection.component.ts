import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiActionButton } from '@fe/ui';

@Component({
  standalone: true,
  selector: 'feat-auth-register-selection',
  imports: [CommonModule, UiActionButton],
  template: `
    <div class="w-full max-w-[480px] fade-in">
      <div class="text-center mb-10">
        <div class="flex justify-center mb-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" fill="var(--color-brand-primary, #1d9bf0)" opacity="0.12"/>
            <circle cx="24" cy="24" r="22" stroke="var(--color-brand-primary, #1d9bf0)" stroke-width="2.5"/>
            <text x="24" y="31" text-anchor="middle" font-size="22" font-weight="800" font-family="inherit" fill="var(--color-brand-primary, #1d9bf0)">C</text>
          </svg>
        </div>
        <h1 class="text-h1 mb-3 text-text-base font-bold" style="font-size:2rem;">Đăng ký Reals</h1>
        <p class="text-muted text-sm leading-relaxed">Tạo hồ sơ, follow các tài khoản khác, quay video<br>của chính bạn, v.v.</p>
      </div>

      <div class="grid gap-3">
        <!-- Phone / Email -->
        <lib-action-button (clicked)="methodSelected.emit('email')">
          <svg icon width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 24C29.5228 24 34 19.5228 34 14C34 8.47715 29.5228 4 24 4C18.4772 4 14 8.47715 14 14C14 19.5228 18.4772 24 24 24Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M42 44C42 34.0589 33.9411 26 24 26C14.0589 26 6 34.0589 6 44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Sử dụng số điện thoại hoặc email
        </lib-action-button>

        <!-- Facebook -->
        <lib-action-button (clicked)="methodSelected.emit('facebook')">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Tiếp tục với Facebook
        </lib-action-button>

        <!-- Google -->
        <lib-action-button (clicked)="methodSelected.emit('google')">
          <svg icon width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
          Tiếp tục với Google
        </lib-action-button>

        <!-- LINE -->
        <lib-action-button (clicked)="methodSelected.emit('line')">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="#00C300"><path d="M23.333 11.161c0-5.029-5.083-9.121-11.333-9.121S.667 6.132.667 11.161c0 4.507 4.028 8.286 9.473 9.006.369.078.871.243 1.144.558.163.189.263.539.141.923 0 0-.431 2.593-.526 3.16-.109.645.147.962.338.99.39.057.683-.189 1.164-.539 1.054-.766 5.86-4.237 7.989-7.258 1.454-1.91 1.942-3.333 1.942-4.86z"/></svg>
          Tiếp tục với LINE
        </lib-action-button>

        <!-- KakaoTalk -->
        <lib-action-button (clicked)="methodSelected.emit('kakao')">
          <svg icon width="20" height="20" viewBox="0 0 24 24">
            <rect width="24" height="24" rx="4" fill="#FEE500"/>
            <path d="M12 4.5C7.306 4.5 3.5 7.36 3.5 10.875c0 2.168 1.44 4.073 3.624 5.189l-.924 3.447c-.083.31.27.558.547.382L11.1 17.06c.297.027.597.04.9.04 4.694 0 8.5-2.86 8.5-6.375S16.694 4.5 12 4.5z" fill="#3A1D1D"/>
          </svg>
          Tiếp tục với KakaoTalk
        </lib-action-button>
      </div>

      <div class="mt-8 text-center text-xs text-muted leading-relaxed max-w-sm mx-auto">
        Bằng việc tiếp tục với tài khoản có vị trí tại <span class="font-semibold text-text-base">Việt Nam</span>, bạn đồng ý với <a href="https://www.tiktok.com/legal/terms-of-service" target="_blank" class="font-semibold text-text-base hover:underline">Điều khoản Dịch vụ</a>, đồng thời xác nhận rằng bạn đã đọc <a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" class="font-semibold text-text-base hover:underline">Chính sách Quyền riêng tư</a> của chúng tôi.
      </div>
    </div>
  `,
})
export class RegisterSelection {
  @Output() methodSelected = new EventEmitter<string>();
}
