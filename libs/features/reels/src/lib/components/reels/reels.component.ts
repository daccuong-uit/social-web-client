import {
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialReelFacade } from '@fe/domain/social';
import { TabKeepAliveService } from '@fe/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReelItemComponent } from '../reel-item/reel-item.component';
import { ReelsCommentsComponent } from '../reels-comments/reels-comments.component';

@Component({
  standalone: true,
  selector: 'fe-reels',
  imports: [CommonModule, ReelItemComponent, ReelsCommentsComponent],
  templateUrl: './reels.component.html',
  styleUrls: ['./reels.component.css'],
})
export class ReelsComponent implements AfterViewInit, OnInit {
  @ViewChild('reelsContainer') reelsContainer!: ElementRef<HTMLDivElement>;

  reelsService = inject(SocialReelFacade);
  private keepAlive = inject(TabKeepAliveService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.reelsService.loadReels();

    this.keepAlive.refreshFor('/reels')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.reelsService.currentIndex.set(0);
        this.reelsService.loadReels();
      });
  }

  ngAfterViewInit() {
    if (!this.reelsContainer) return;
  }

  formatCount(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') { e.preventDefault(); this.reelsService.goToPrev(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.reelsService.goToNext(); }
    if (e.key === 'Escape') { this.reelsService.closeComments(); }
  }

  private isScrolling = false;

  @HostListener('window:wheel', ['$event'])
  onWheel(e: WheelEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('fe-reels-right-sidebar') || target.closest('.sidebar-right') || target.closest('.reels-comments-panel')) {
      return;
    }

    if (this.isScrolling) return;

    if (e.deltaY > 50) {
      this.reelsService.goToNext();
      this.lockScroll();
    } else if (e.deltaY < -50) {
      this.reelsService.goToPrev();
      this.lockScroll();
    }
  }

  private lockScroll() {
    this.isScrolling = true;
    setTimeout(() => {
      this.isScrolling = false;
    }, 600);
  }

  trackReel(_: number, item: any): string {
    return item.id;
  }
}