import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@fe/core';

@Component({
  standalone: true,
  selector: 'feat-home-page',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="domain-launcher">
      <header class="launcher-header">
        <span class="launcher-kicker">Reals platform</span>
        <h1>Chọn không gian làm việc</h1>
        <p>Xin chào, {{ userDisplayName }}. Bạn muốn khám phá điều gì hôm nay?</p>
      </header>
      <main class="domain-grid">
        <a class="domain-card domain-social" routerLink="/social"><span class="domain-card-art">●</span><span class="domain-card-copy"><strong>Bài đăng</strong><small>Chia sẻ, kết nối và trò chuyện</small></span></a>
        <a class="domain-card domain-video" routerLink="/video"><span class="domain-card-art">▶</span><span class="domain-card-copy"><strong>Video</strong><small>Xem những nội dung nổi bật</small></span></a>
        <a class="domain-card domain-shop" routerLink="/shop"><span class="domain-card-art">+</span><span class="domain-card-copy"><strong>Shop</strong><small>Khám phá sản phẩm phù hợp</small></span></a>
        <a class="domain-card domain-stories" routerLink="/stories"><span class="domain-card-art">Aa</span><span class="domain-card-copy"><strong>Truyện</strong><small>Đọc những câu chuyện mới</small></span></a>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .domain-launcher { min-height: 100vh; padding: 10vh clamp(24px, 8vw, 128px); background: var(--color-surface-base); color: var(--color-text-base); }
    .launcher-header { max-width: 720px; margin: 0 auto 48px; text-align: center; }
    .launcher-kicker { color: var(--color-brand-primary); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
    h1 { margin: 12px 0 8px; font-size: clamp(2rem, 5vw, 4rem); line-height: 1.05; }
    p { margin: 0; color: var(--color-text-muted); }
    .domain-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; max-width: 980px; margin: auto; }
    .domain-card { min-height: 240px; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--color-border-subtle); border-radius: 8px; color: inherit; text-decoration: none; overflow: hidden; transition: transform 180ms ease, box-shadow 180ms ease; }
    .domain-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12); }
    .domain-card-art { align-self: flex-end; font-size: 5rem; font-weight: 700; line-height: 1; opacity: 0.8; }
    .domain-card-copy { display: flex; flex-direction: column; gap: 5px; }
    .domain-card-copy strong { font-size: 1.5rem; }
    .domain-card-copy small { color: inherit; opacity: 0.74; }
    .domain-social { background: linear-gradient(135deg, #e8f3ff, #b9dcff); color: #123251; }
    .domain-video { background: linear-gradient(135deg, #ffe6ea, #ffc3cc); color: #541d2a; }
    .domain-shop { background: linear-gradient(135deg, #fff2cc, #f8d888); color: #4e3510; }
    .domain-stories { background: linear-gradient(135deg, #e9e3ff, #cabdff); color: #30205e; }
    @media (max-width: 640px) { .domain-launcher { padding: 48px 18px; } .domain-grid { grid-template-columns: 1fr; gap: 14px; } .domain-card { min-height: 180px; } }
  `],
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get userDisplayName() {
    const user = this.authService.user();
    return user?.displayName || user?.username || user?.email || 'creator';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
