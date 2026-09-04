import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { FriendsLayoutService } from '../services/friends-layout.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { PageShellComponent, SidebarMenuItem, GLOBAL_MENU_ITEMS, UiTabsComponent, UiTab } from '@fe/ui';
import { FriendProfileComponent } from '../components/friend-profile/friend-profile.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'fe-friends-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, PageShellComponent, UiTabsComponent, FriendProfileComponent],
  templateUrl: './friends.html',
  styleUrls: ['./friends.css'],
})
export class FriendsComponent {
  private router = inject(Router);

  /** Global nav — same as home-shell, Bạn bè item active */
  readonly menuItems: SidebarMenuItem[] = GLOBAL_MENU_ITEMS;

  /** Friends sub-navigation — shown as top horizontal tabs */
  readonly friendsMenuItems: SidebarMenuItem[] = [
    {
      id: 'all',
      label: 'Tất cả',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      link: '/friends/all',
    },
    {
      id: 'requests',
      label: 'Lời mời',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',
      link: '/friends/requests',
    },
    {
      id: 'sent',
      label: 'Đã gửi',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      link: '/friends/sent',
    },
    {
      id: 'suggestions',
      label: 'Gợi ý',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
      link: '/friends/suggestions',
    },
    {
      id: 'relationships',
      label: 'Bạn thân',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
      link: '/friends/relationships',
    },
    {
      id: 'following',
      label: 'Đang follow',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      link: '/friends/following',
    },
    {
      id: 'followers',
      label: 'Được follow',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
      link: '/friends/followers',
    },
    {
      id: 'blocked',
      label: 'Đã chặn',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
      link: '/friends/blocked',
    },
    {
      id: 'muted',
      label: 'Ẩn (Mute)',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
      link: '/friends/muted',
    },
  ];

  uiTabs = computed<UiTab[]>(() =>
    this.friendsMenuItems.map(item => ({
      id: item.id,
      label: item.label,
      icon: item.svgIcon,
      link: item.link
    }))
  );

  activeTabId = computed(() => {
    const current = this.currentUrl();
    const active = this.friendsMenuItems.find(item => current.includes(item.link || ''));
    return active ? active.id : null;
  });

  currentUrl = signal(this.router.url);
  // Inject layout service to share selected friend state
  private layoutService = inject(FriendsLayoutService);

  // Expose selected friend via getter for template binding
  get selectedFriend() {
    return this.layoutService.selectedFriend();
  }

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects);
      this.layoutService.selectFriend(null);
    });
  }

  // Note: mobile nav is now handled by UiTabsComponent
  isActive(link: string | undefined): boolean {
    if (!link) return false;
    return this.currentUrl().includes(link);
  }
}
