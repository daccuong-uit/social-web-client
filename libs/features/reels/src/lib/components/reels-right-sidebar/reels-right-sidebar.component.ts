import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, ApiService } from '@fe/core';
import { SocialReelFacade } from '@fe/domain/social';
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
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  reelsService = inject(SocialReelFacade);

  @ViewChild('menuDropdown') menuDropdown: any;

  user = this.authService.user;
  showMenu = signal(false);

  // ─── Profile menu ────────────────────────────────────────────────────────────

  toggleMenu(event?: Event) {
    if (event) event.stopPropagation();
    this.showMenu.update((v) => !v);
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showMenu() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
