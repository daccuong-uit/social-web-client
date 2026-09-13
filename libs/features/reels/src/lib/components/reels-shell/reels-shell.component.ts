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
    <ui-page-shell [menuItems]="menuItems" [showRightbar]="true">
      <div slot="main" class="reels-shell-main">
        <router-outlet></router-outlet>
      </div>
      <fe-reels-right-sidebar slot="rightbar"></fe-reels-right-sidebar>
    </ui-page-shell>
  `,
  styles: [`
    :host { display: block; width: 100%; min-height: 100%; }
    .reels-shell-main { width: 100%; min-height: 100%; }
    @media (max-width: 859.98px) {
      :host,
      :host ::ng-deep ui-page-shell,
      :host ::ng-deep ui-page-shell .page-shell {
        width: 100vw;
        max-width: none;
      }
      :host ::ng-deep ui-page-shell .page-shell { height: 100dvh; min-height: 100dvh; }
      :host ::ng-deep ui-page-shell .page-main { height: calc(100dvh - 48px); min-height: calc(100dvh - 48px); }
      :host ::ng-deep ui-page-shell .page-main-content { height: 100%; min-height: 100%; }
    }
  `]
})
export class ReelsShellComponent {
  readonly menuItems: SidebarMenuItem[] = GLOBAL_MENU_ITEMS;
}

