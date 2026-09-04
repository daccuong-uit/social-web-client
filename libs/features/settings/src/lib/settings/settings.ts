import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarMenuComponent, SidebarMenuItem, SharedHeaderComponent } from '@fe/ui';
import { UiSettingsComponent } from '../ui-settings/ui-settings.component';

import { UiButton } from '@fe/ui';

@Component({
  selector: 'lib-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarMenuComponent, SharedHeaderComponent, UiSettingsComponent, UiButton],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  // stroke-width="2.5" matches BottomMenuComponent icon style
  tabs: SidebarMenuItem[] = [
    {
      id: 'appearance',
      label: 'Appearance',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><path d="M12 1v6m6.66-1.66l-4.24 4.24m1 5.66l4.24-4.24M12 23v-6m6.66 1.66l-4.24-4.24m-5.32 4.24l-4.24 4.24M1 12h6m1 6.66l4.24-4.24m5.66 1l-4.24 4.24M23 12h-6m-1-6.66l-4.24 4.24"></path></svg>'
    },
    {
      id: 'account',
      label: 'Manage account',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
    },
    {
      id: 'notifications',
      label: 'Push notifications',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>'
    },
    {
      id: 'business',
      label: 'Business verification',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
    },
    {
      id: 'ads',
      label: 'Ads',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>'
    },
    {
      id: 'screentime',
      label: 'Screen time',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
    },
    {
      id: 'content',
      label: 'Content preferences',
      svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>'
    }
  ];

  selectedTab = signal<string>('appearance');
  private location = inject(Location);

  goBack() {
    this.location.back();
  }

  selectTab(tab: SidebarMenuItem) {
    this.selectedTab.set(tab.id);
    const element = document.getElementById(tab.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
