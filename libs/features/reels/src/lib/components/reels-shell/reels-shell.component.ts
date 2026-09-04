import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageShellComponent, SidebarMenuItem, GLOBAL_MENU_ITEMS } from '@fe/ui';
import { ReelsRightSidebarComponent } from '../reels-right-sidebar/reels-right-sidebar.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, PageShellComponent, ReelsRightSidebarComponent],
  selector: 'fe-reels-shell',
  template: `
    <div style="display: flex; width: 100%; height: 100%;">
      <ui-page-shell [menuItems]="menuItems" [showRightbar]="true" style="flex: 1; min-width: 0;">
        <div slot="main" style="width: 100%; height: 100%;">
          <router-outlet></router-outlet>
        </div>
        <fe-reels-right-sidebar slot="rightbar"></fe-reels-right-sidebar>
      </ui-page-shell>
      <div style="width: 16px; flex-shrink: 0; background: transparent;"></div>
    </div>
  `,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class ReelsShellComponent {
  readonly menuItems: SidebarMenuItem[] = GLOBAL_MENU_ITEMS;
}

