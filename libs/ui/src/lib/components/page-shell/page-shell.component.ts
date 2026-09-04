import {
  Component,
  Input,
  HostBinding,
  inject,
  signal,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarMenuComponent, SidebarMenuItem } from '../sidebar-menu/sidebar-menu.component';
import { AuthService } from '@fe/core';

/**
 * PageShellComponent — Unified 3-column layout shell.
 *
 * Replaces the duplicated grid code in home-shell, profile.component
 * and any other full-page layout. All breakpoints and sidebar widths
 * come from global CSS tokens (--page-sidebar-width etc.) defined in
 * styles.css, so changing a token propagates everywhere automatically.
 *
 * Usage:
 *   <ui-page-shell [menuItems]="items">
 *     <ng-container slot="main">…main content…</ng-container>
 *     <ng-container slot="rightbar">…right sidebar…</ng-container>
 *   </ui-page-shell>
 */
@Component({
  selector: 'ui-page-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarMenuComponent],
  templateUrl: './page-shell.component.html',
  styleUrls: ['./page-shell.component.css'],
})
export class PageShellComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  user = this.authService.user;

  /** Navigation items rendered in the left sidebar. */
  @Input() menuItems: SidebarMenuItem[] = [];

  /** Whether to render the right sidebar column. Default: true. */
  @Input() showRightbar = true;

  /** routerLink for the brand logo. Default: /home */
  @Input() brandLink = '/home';

  /** Show the bottom settings footer in the left sidebar. */
  @Input() showSettingsFooter = true;

  /**
   * Force the global left sidebar into icon-only (collapsed) mode.
   * Use [collapsed]="true" on pages that have their own sub-navigation
   * (e.g. the Bạn bè page), so the global sidebar stays out of the way.
   */
  @Input() collapsed = false;

  @HostBinding('class.sidebar-collapsed') get isCollapsed() { return this.collapsed; }

  showUserMenu = signal(false);
  mobileMenuOpen = signal(false);

  toggleUserMenu(e: Event) {
    e.stopPropagation();
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  toggleMobileMenu(e: Event) {
    e.stopPropagation();
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.showUserMenu() &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.closeUserMenu();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
