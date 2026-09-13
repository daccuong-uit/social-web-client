import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '@fe/core';

@Component({
  selector: 'ui-shared-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.css']
})
export class SharedHeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  user = this.authService.user;
  showMenu = signal(false);

  @Input() showBack = false;
  @Input() brandLink = '/social';
  @Input() sidebarCollapsed = false;
  @Output() menuToggle = new EventEmitter<void>();

  get domainBrandLink(): string {
    const url = this.router.url.split('?')[0].replace(/\/+$/, '') || '/social';

    if (url.startsWith('/video')) return '/video';
    if (url.startsWith('/shop')) return '/shop';
    if (url.startsWith('/stories')) return '/stories';
    if (url.startsWith('/profile')) return '/profile';
    if (url.startsWith('/friends')) return '/friends';
    if (url.startsWith('/media')) return '/media';
    if (url.startsWith('/dashboard')) return '/dashboard';
    if (url.startsWith('/settings')) return '/settings';
    if (url.startsWith('/social')) return '/social';
    if (url.startsWith('/home')) return '/social';

    return this.brandLink || '/social';
  }

  goBack() {
    this.location.back();
  }

  toggleUserMenu() {
    this.showMenu.update((value) => !value);
  }

  closeUserMenu() {
    this.showMenu.set(false);
  }

  toggleNavigationMenu() {
    this.menuToggle.emit();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
