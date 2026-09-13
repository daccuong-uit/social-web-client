import { Component } from '@angular/core';
import { PageShellComponent, SidebarMenuItem, GLOBAL_MENU_ITEMS } from '@fe/ui';
import { FeedComponent } from '@fe/features/feed';
import { RightSidebarComponent } from '../right-sidebar/right-sidebar.component';

@Component({
  standalone: true,
  selector: 'fe-social-shell',
  imports: [PageShellComponent, FeedComponent, RightSidebarComponent],
  template: `
    <ui-page-shell [menuItems]="menuItems" brandLink="/home">
      <fe-feed slot="main"></fe-feed>
      <fe-right-sidebar slot="rightbar"></fe-right-sidebar>
    </ui-page-shell>
  `,
})
export class SocialShellComponent {
  menuItems: SidebarMenuItem[] = GLOBAL_MENU_ITEMS;
}