import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@fe/core';
import { ProfileFacade } from '../../data-access/profile.facade';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'feat-profile-right-sidebar',
  templateUrl: './profile-right-sidebar.component.html',
  styleUrls: ['./profile-right-sidebar.component.css'],
})
export class ProfileRightSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private profileFacade = inject(ProfileFacade);

  @ViewChild('menuDropdown') menuDropdown: any;
  @ViewChild('reelsContainer') reelsContainer!: ElementRef<HTMLDivElement>;

  user = this.authService.user;
  profileData = this.profileFacade.profile;

  // Tự động kiểm tra xem user hiện tại có phải chủ sở hữu profile này không
  isOwner = computed(() => {
    const currentUserId = this.user()?.id;
    const profileUserId = this.profileData()?.id;
    return !!currentUserId && currentUserId === profileUserId;
  });

  showMenu = signal(false);

  // Mock metrics for Studio
  videoCount = signal(5);
  viewsCount = signal(120);

  location = computed(() => this.profileData()?.location || 'Hồ Chí Minh, Việt Nam');
  from = computed(() => 'Hà Nội, Việt Nam');
  birthday = computed(() => '01/01/1995');
  family = computed(() => 'Độc thân');
  gender = computed(() => 'Nam');

  mockReels = signal([
    { id: 1, title: 'Bí kíp quay video triệu view', views: '1.2M', cover: 'https://picsum.photos/300/500?random=11' },
    { id: 2, title: 'Cách edit video siêu nhanh', views: '850K', cover: 'https://picsum.photos/300/500?random=12' },
    { id: 3, title: 'Xu hướng Reels mới nhất', views: '500K', cover: 'https://picsum.photos/300/500?random=13' }
  ]);

  // ═══════════════════════════════════════════════════════════
  // Handlers cho Slider Tin Nổi Bật
  // ═══════════════════════════════════════════════════════════
  scrollLeft(): void {
    if (this.reelsContainer) {
      this.reelsContainer.nativeElement.scrollBy({ left: -160, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.reelsContainer) {
      this.reelsContainer.nativeElement.scrollBy({ left: 160, behavior: 'smooth' });
    }
  }

  onActionClick(): void {
    if (this.isOwner()) {
      // Logic mở modal/chuyển trang Chỉnh sửa tin nổi bật
      console.log('Mở modal chỉnh sửa tin nổi bật');
    } else {
      // Logic xem tất cả tin nổi bật của người dùng
      console.log('Xem tất cả tin nổi bật');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Menu & Auth Handlers
  // ═══════════════════════════════════════════════════════════
  toggleMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showMenu.update(v => !v);
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.showMenu() &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.closeMenu();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}