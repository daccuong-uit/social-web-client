// Reals Admin Dashboard Component
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@fe/core';

@Component({
  standalone: true,
  selector: 'feat-dashboard-main',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get userDisplayName() {
    const user = this.authService.user();
    return user?.displayName || user?.username || user?.email || 'admin';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
