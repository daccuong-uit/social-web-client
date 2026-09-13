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
    :host {
      display: block;
      width: 100%;
      height: 100dvh;
      min-height: 0;
      overflow: hidden;
    }
    .reels-shell-main { width: 100%; height: 100%; min-height: 0; }
    :host ::ng-deep ui-page-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
    :host ::ng-deep ui-page-shell .page-shell {
      flex: 1 1 auto;
      height: auto;
      min-height: 0;
      overflow: hidden;
    }
    :host ::ng-deep ui-page-shell .page-main,
    :host ::ng-deep ui-page-shell .page-main-content {
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
    :host ::ng-deep ui-page-shell .page-main-content {
      padding-bottom: 0;
    }
    :host ::ng-deep ui-page-shell .page-rightbar {
      top: 0;
      height: 100%;
      max-height: 100%;
    }
    @media (max-width: 859.98px) {
      :host,
      :host ::ng-deep ui-page-shell,
      :host ::ng-deep ui-page-shell .page-shell {
        width: 100vw;
        max-width: none;
      }
      :host ::ng-deep ui-page-shell .page-shell { height: auto; min-height: 0; }
      :host ::ng-deep ui-page-shell .page-main,
      :host ::ng-deep ui-page-shell .page-main-content { height: 100%; min-height: 0; }
      :host ::ng-deep ui-page-shell .page-shell {
        display: flex;
        width: 100%;
      }
      :host ::ng-deep ui-page-shell .page-sidebar {
        display: none;
      }
      :host ::ng-deep ui-page-shell .page-main {
        width: 100%;
        max-width: none;
        flex: 1 1 auto;
      }
      :host ::ng-deep ui-page-shell .page-main-content {
        width: 100%;
        max-width: none;
        border: 0;
      }
    }
  `]
})
export class ReelsShellComponent {
  readonly menuItems: SidebarMenuItem[] = GLOBAL_MENU_ITEMS;
}

