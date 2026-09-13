import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@fe/core';

@Component({
  selector: 'ui-current-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './current-user-card.component.html',
  styleUrls: ['./current-user-card.component.css'],
})
export class CurrentUserCardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  @Input() showActions = true;

  readonly user = this.authService.user;
  readonly showMenu = signal(false);

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.showMenu.update((value) => !value);
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showMenu() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
}
