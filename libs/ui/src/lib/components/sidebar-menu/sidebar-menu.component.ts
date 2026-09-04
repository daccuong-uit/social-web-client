import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SafeHtmlPipe } from './safe-html.pipe';
import { TabKeepAliveService } from '@fe/core';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: string;
  svgIcon?: string;
  link?: string;
  exactMatch?: boolean;
  isAi?: boolean;
  badge?: string;
}

@Component({
  selector: 'ui-sidebar-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css']
})
export class SidebarMenuComponent {
  private router = inject(Router);
  private keepAlive = inject(TabKeepAliveService);

  @Input() items: SidebarMenuItem[] = [];
  @Input() activeItemId: string | null = null;

  @Output() itemClick = new EventEmitter<SidebarMenuItem>();

  onItemClick(item: SidebarMenuItem, event: Event) {
    if (!item.link) {
      // Button-style items (no route) — emit for parent to handle
      event.preventDefault();
      this.itemClick.emit(item);
      return;
    }

    // Normalise both URLs: strip query-params and trailing slashes
    const normalise = (url: string) => url.split('?')[0].replace(/\/+$/, '');
    const currentUrl = normalise(this.router.url);
    const targetUrl  = normalise(item.link);

    /**
     * isAlreadyActive: true only when the user is clicking the tab
     * that is *currently* rendered.
     *
     * Two modes:
     *  1. exactMatch  → strict equality (e.g. /home === /home)
     *  2. prefix mode → current URL must equal target OR start with
     *                   target + '/' (path boundary).
     *                   This prevents /home/discover from being treated
     *                   as "inside" /home when Home is clicked.
     */
    const isAlreadyActive = item.exactMatch
      ? currentUrl === targetUrl
      : currentUrl === targetUrl || currentUrl.startsWith(targetUrl + '/');

    if (isAlreadyActive) {
      // Prevent Angular Router from re-navigating (would destroy component)
      event.preventDefault();
      this.keepAlive.triggerRefresh(item.link);
    }
    // else: let the routerLink directive handle normal navigation
  }
}
