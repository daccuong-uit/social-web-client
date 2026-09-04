import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  Router,
  NavigationEnd
} from '@angular/router';
import { AuthService } from '@fe/core';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'fe-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.css'],
})
export class RightSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  @ViewChild('menuDropdown')
  menuDropdown: any;

  user = this.authService.user;

  showMenu = signal(false);
  isHome = signal(true);
  isProfile = signal(false);

  constructor() {
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
    this.isHome.set(url === '/home' || url === '/');
    this.isProfile.set(url === '/profile' || url.startsWith('/profile'));
  }

  toggleMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.showMenu.update(v => !v);
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(event: MouseEvent) {
    if (
      this.showMenu() &&
      !this.elementRef.nativeElement.contains(
        event.target
      )
    ) {
      this.closeMenu();
    }
  }

  logout() {
    this.authService.logout();

    this.router.navigate([
      '/auth/login',
    ]);
  }
}
