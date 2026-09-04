import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SocialReelFacade, ReelItem } from '@fe/domain/social';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'lib-feed-reels-strip',
  templateUrl: './feed-reels-strip.component.html',
  styleUrls: ['./feed-reels-strip.component.css'],
})
export class FeedReelsStripComponent {
  private reelFacade = inject(SocialReelFacade);
  private sanitizer = inject(DomSanitizer);

  getThumbnailStyle(url: string | undefined): SafeStyle | string {
    if (!url) return 'none';
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  /** Friend reels signal exposed from facade */
  friendReels = this.reelFacade.friendReels;

  /** Emits when user clicks "+" to add a reel */
  @Output() addReel = new EventEmitter<void>();

  /** Emits when user clicks a friend reel item */
  @Output() openReel = new EventEmitter<ReelItem>();

  onAddReel(): void {
    this.addReel.emit();
  }

  onOpenReel(reel: ReelItem): void {
    this.openReel.emit(reel);
  }

  trackById(index: number, item: ReelItem): string | number {
    return item?.id || index;
  }
}
