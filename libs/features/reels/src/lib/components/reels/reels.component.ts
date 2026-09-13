import {
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  inject,
  DestroyRef,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialReelFacade } from '@fe/entities/social';
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
export class ReelsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('reelsContainer') reelsContainer!: ElementRef<HTMLDivElement>;

  reelsService = inject(SocialReelFacade);
  private keepAlive = inject(TabKeepAliveService);
  private destroyRef = inject(DestroyRef);
  private hostElement = inject(ElementRef<HTMLElement>);
  private layoutObserver?: ResizeObserver;
  private contentObserver?: MutationObserver;
  private previousHtmlOverflow = '';
  private previousBodyOverflow = '';
  private previousHtmlScrollbarGutter = '';
  private pageScrollLocked = false;

  videoFillsMain = signal(false);

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
    if (window.innerWidth <= 600) {
      const documentElement = this.hostElement.nativeElement.ownerDocument.documentElement;
      const body = this.hostElement.nativeElement.ownerDocument.body;
      this.previousHtmlOverflow = documentElement.style.overflow;
      this.previousBodyOverflow = body.style.overflow;
      this.previousHtmlScrollbarGutter = documentElement.style.scrollbarGutter;
      documentElement.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      documentElement.style.scrollbarGutter = 'auto';
      this.pageScrollLocked = true;
    }

    const center = this.hostElement.nativeElement.querySelector('.reels-center');
    if (!center) return;

    this.layoutObserver = new ResizeObserver(() => this.updateOverlayMode());
    this.layoutObserver.observe(center);
    this.layoutObserver.observe(this.hostElement.nativeElement);
    this.contentObserver = new MutationObserver(() => this.updateOverlayMode());
    this.contentObserver.observe(center, { childList: true, subtree: true });
    requestAnimationFrame(() => this.updateOverlayMode());
  }

  ngOnDestroy(): void {
    this.layoutObserver?.disconnect();
    this.contentObserver?.disconnect();
    if (this.pageScrollLocked) {
      const documentElement = this.hostElement.nativeElement.ownerDocument.documentElement;
      const body = this.hostElement.nativeElement.ownerDocument.body;
      documentElement.style.overflow = this.previousHtmlOverflow;
      body.style.overflow = this.previousBodyOverflow;
      documentElement.style.scrollbarGutter = this.previousHtmlScrollbarGutter;
    }
  }

  private updateOverlayMode(): void {
    const center = this.hostElement.nativeElement.querySelector('.reels-center');
    const video = this.hostElement.nativeElement.querySelector('.reel-video-card');
    if (!center || !video) return;

    const mainBounds = center.getBoundingClientRect();
    const videoBounds = video.getBoundingClientRect();
    const bottomGap = Math.max(0, mainBounds.bottom - videoBounds.bottom);
    center.style.setProperty('--video-bottom-gap', `${bottomGap}px`);
    const mainCenter = mainBounds.top + mainBounds.height / 2;
    const videoCenter = videoBounds.top + videoBounds.height / 2;
    center.style.setProperty('--video-center-offset', `${mainCenter - videoCenter}px`);
    const metadata = this.hostElement.nativeElement.querySelector('.reel-overlay-info');
    const metadataHeight = metadata?.getBoundingClientRect().height ?? 0;
    const requiredBottomSpace = metadataHeight + 12;

    // Keep metadata over the video until the space below it can contain the full block.
    this.videoFillsMain.set(bottomGap < requiredBottomSpace);
  }

  currentReelBackdrop(): string {
    const reel = this.reelsService.currentReel();
    return reel?.thumbnailUrl || '';
  }

  formatCount(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }

  reelItemAspect(index: number): number {
    const reel = this.reelsService.reels()[index] as any;
    const width = Number(reel?.width ?? reel?.videoWidth ?? reel?.frameWidth);
    const height = Number(reel?.height ?? reel?.videoHeight ?? reel?.frameHeight);
    const reportedRatio = Number(reel?.aspectRatio ?? reel?.ratio);
    const ratio = width > 0 && height > 0 ? width / height : reportedRatio > 0 ? reportedRatio : 9 / 16;
    if (ratio > 1.05) return 16 / 9;
    if (ratio >= 0.7) return 4 / 5;
    return 9 / 16;
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