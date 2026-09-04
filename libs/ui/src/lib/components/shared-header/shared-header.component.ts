import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '@fe/core';

@Component({
  selector: 'ui-shared-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.css']
})
export class SharedHeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  user = this.authService.user;
  showMenu = signal(false);
  
  @Input() showBack = false;

  goBack() {
    this.location.back();
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
