import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { reelsRoutes } from './reels.routes';
import { ReelsShellComponent } from './components/reels-shell/reels-shell.component';
import { ReelsComponent } from './components/reels/reels.component';
import { ReelsRightSidebarComponent } from './components/reels-right-sidebar/reels-right-sidebar.component';

@NgModule({
  imports: [
    CommonModule,
    ReelsShellComponent,
    ReelsComponent,
    ReelsRightSidebarComponent,
    RouterModule.forChild(reelsRoutes),
  ],
})
export class ReelsModule {}
