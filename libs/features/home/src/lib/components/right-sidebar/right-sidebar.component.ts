import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@fe/core';
import { filter } from 'rxjs/operators';
import { SocialFacade } from '@fe/entities/social';
import { UserCardComponent } from '@fe/ui';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, UserCardComponent],
  selector: 'fe-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.css'],
})
export class RightSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private socialFacade = inject(SocialFacade);

  user = this.authService.user;
  suggestedUsers = this.socialFacade.suggestedUsers;

  isHome = signal(true);
  isProfile = signal(false);

  constructor() {
    this.socialFacade.loadSuggestedUsers();
    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        )
      )
      .subscribe((event: any) => {
        this.updateRouteFlags(event.url);
      });

    this.updateRouteFlags(this.router.url);
  }

  private updateRouteFlags(url: string) {
    this.isHome.set(url === '/home' || url === '/' || url === '/social');
    this.isProfile.set(url === '/profile' || url.startsWith('/profile'));
  }

  logout() {
    this.authService.logout();

    this.router.navigate([
      '/auth/login',
    ]);
  }

  onToggleFollow(user: any) {
    this.socialFacade.toggleFollow(user);
  }
}