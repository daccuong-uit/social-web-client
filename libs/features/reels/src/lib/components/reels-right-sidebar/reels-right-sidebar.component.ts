import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@fe/core';
import { SocialReelFacade } from '@fe/entities/social';
import { ReelsCommentsComponent } from '../reels-comments/reels-comments.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReelsCommentsComponent],
  selector: 'fe-reels-right-sidebar',
  templateUrl: './reels-right-sidebar.component.html',
  styleUrls: ['./reels-right-sidebar.component.css'],
})
export class ReelsRightSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  reelsService = inject(SocialReelFacade);

  user = this.authService.user;

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
