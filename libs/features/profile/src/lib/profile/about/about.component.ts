import { Component, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarMenuComponent, SidebarMenuItem } from '@fe/ui';
import { RelativeTimePipe } from '@fe/core';

@Component({
    selector: 'app-profile-about',
    standalone: true,
    imports: [CommonModule, SidebarMenuComponent, RelativeTimePipe],
    templateUrl: './about.component.html',
    styleUrl: './about.component.css'
})
export class AboutComponent {
    @Input() profile: any;

    tabs: SidebarMenuItem[] = [
        {
            id: 'overview',
            label: 'Tổng quan',
            svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        },
        {
            id: 'personal',
            label: 'Thông tin cơ bản',
            svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="13" y2="12"></line></svg>'
        },
        {
            id: 'contact',
            label: 'Thông tin liên hệ',
            svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>'
        },
        {
            id: 'hobbies',
            label: 'Sở thích',
            svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>'
        }
    ];

    selectedTab = signal<string>('overview');

    selectTab(tab: SidebarMenuItem | string | any) {
        const tabId = typeof tab === 'string' ? tab : tab?.id;
        if (tabId) {
            this.selectedTab.set(tabId);
        }
    }
}