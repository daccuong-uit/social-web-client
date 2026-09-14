import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@fe/core';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster],
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <ngx-sonner-toaster position="top-right" richColors />
  `,
})
export class AppComponent {
  private authService = inject(AuthService);

  constructor() {
    this.authService.checkAuth();
  }
}

