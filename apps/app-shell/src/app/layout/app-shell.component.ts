import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '@fe/core';
import { SharedHeaderComponent } from '@fe/ui';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterModule, SharedHeaderComponent],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isFriendsRoute = () => this.currentUrl()?.startsWith('/friends') ?? false;
}
