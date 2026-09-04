import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@fe/core';
import { UiButton, UiCard } from '@fe/ui';

@Component({
  standalone: true,
  selector: 'feat-home-page',
  imports: [CommonModule, RouterModule, UiCard, UiButton],
  template: `
    <div class="flex min-h-screen w-full items-center justify-center p-6">
      <lib-card class="max-w-3xl">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-surface-subtle pb-8 mb-8">
          <div class="flex items-center gap-4">
             <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary text-3xl">
                👋
             </div>
             <div>
                <h1 class="text-3xl font-bold tracking-tight text-text-base">Welcome back!</h1>
                <p class="text-text-muted">Hello, <span class="font-bold text-brand-primary">{{ userDisplayName }}</span></p>
             </div>
          </div>
          <lib-button type="button" routerLink="/profile" class="!w-auto !rounded-xl !bg-brand-primary !text-white hover:!bg-brand-primary/90 transition-all">
            Hồ sơ của bạn
          </lib-button>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
          <div class="rounded-2xl bg-brand-primary/5 p-6 border border-brand-primary/10">
            <h3 class="text-lg font-bold text-brand-primary mb-3">Quick Start</h3>
            <p class="text-sm text-text-muted mb-4">
              Manage your creator content and grow your audience.
            </p>
            <div class="flex flex-col gap-2">
              <a routerLink="/profile" class="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90">
                Edit Profile
              </a>
              <a routerLink="/media" class="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-text-base transition hover:bg-surface-subtle">
                Open Media Platform (creator files)
              </a>
              <a routerLink="/media/studio" class="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-text-base transition hover:bg-surface-subtle">
                Open Media Studio (admin files)
              </a>
              <a routerLink="/dashboard" class="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-base px-4 py-2 text-sm font-semibold text-text-base transition hover:bg-surface-subtle">
                Open Dashboard
              </a>
            </div>
          </div>
          
          <div class="rounded-2xl bg-surface-muted p-6 border border-border-subtle">
            <h3 class="text-lg font-bold text-text-base mb-3">Platform Status</h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2 text-text-base">
                <span class="flex h-2 w-2 rounded-full bg-green-500"></span>
                Authenticated
              </li>
              <li class="flex items-center gap-2 text-text-base">
                <span class="flex h-2 w-2 rounded-full bg-green-500"></span>
                Ready to create
              </li>
              <li class="flex items-center gap-2 text-text-base">
                <span class="flex h-2 w-2 rounded-full bg-green-500"></span>
                Social Commerce
              </li>
            </ul>
          </div>
        </div>
      </lib-card>
    </div>
  `,
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
