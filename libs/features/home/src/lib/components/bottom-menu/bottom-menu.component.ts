import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarMenuComponent, SidebarMenuItem } from '@fe/ui';
import { TabKeepAliveService } from '@fe/core';

/**
 * BottomMenuComponent — mobile/tablet bottom navigation bar.
 *
 * Mirrors the behaviour of SidebarMenuComponent:
 *   - Switching to a different tab navigates normally (Keep-Alive handled by HomeShell).
 *   - Tapping the already-active tab scrolls to top + refetches via TabKeepAliveService.
 *
 * NOTE: This component's own item clicks are NOT routed through SidebarMenuComponent
 * because it renders a flat <nav> bar on mobile. We replicate the active-tab
 * intercept logic here directly, but delegate refresh to TabKeepAliveService.
 */
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarMenuComponent],
  selector: 'fe-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.css'],
})
export class BottomMenuComponent {
  private router    = inject(Router);
  private keepAlive = inject(TabKeepAliveService);

  items: SidebarMenuItem[] = [
    {
      id: 'home',
      label: 'Trang chủ',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5L12 4l8 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5Z"></path><path d="M9 21V12h6v9"></path></svg>',
      link: '/home',
      exactMatch: true,
    },
    {
      id: 'reels',
      label: 'Reels',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"></rect><path d="M9 7v10l7-5L9 7Z"></path></svg>',
      link: '/reels',
    },
    {
      id: 'discover',
      label: 'Khám phá',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.5-4.5"></path></svg>',
      link: '/home/discover',
    },
    {
      id: 'notifications',
      label: 'Thông báo',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path></svg>',
      link: '/home/notifications',
    },
    {
      id: 'chat',
      label: 'Tin nhắn',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
      link: '/home/chat',
    },
    {
      id: 'reals-ai',
      label: 'Reals AI',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      link: '/home/reals-ai',
      badge: 'Mới',
      isAi: true,
    },
    {
      id: 'bookmarks',
      label: 'Đã lưu',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12a2 2 0 0 1 2 2v16l-8-5-8 5V5a2 2 0 0 1 2-2Z"></path></svg>',
      link: '/home/bookmarks',
    },
    {
      id: 'profile',
      label: 'Hồ sơ',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3"></circle><path d="M5.5 20.5c1.5-2.5 4-4 6.5-4s5 1.5 6.5 4"></path></svg>',
      link: '/profile',
      exactMatch: true,
    },
  ];

  /**
   * Called by ui-sidebar-menu's (itemClick) output for button-style items,
   * OR we can hook directly here for extra logic.
   * The active-tab refresh is handled inside SidebarMenuComponent which uses
   * TabKeepAliveService directly — nothing extra needed here.
   */
  onItemClick(_item: SidebarMenuItem): void {
    // Intentionally empty: SidebarMenuComponent already handles active-tab refresh.
    // This output exists for any future button-style (non-link) items.
  }
}
