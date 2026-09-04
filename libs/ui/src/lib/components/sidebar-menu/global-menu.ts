import { SidebarMenuItem } from './sidebar-menu.component';

export const GLOBAL_MENU_ITEMS: SidebarMenuItem[] = [
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
    id: 'friends',
    label: 'Bạn bè',
    svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    link: '/friends',
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
