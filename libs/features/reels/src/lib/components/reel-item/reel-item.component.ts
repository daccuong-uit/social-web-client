import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialReelFacade } from '@fe/entities/social';
import Hls from 'hls.js';

@Component({
  standalone: true,
  selector: 'fe-reel-item',
  imports: [CommonModule],
  templateUrl: './reel-item.component.html',
  styleUrls: ['./reel-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReelItemComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() reel!: any;
  @Input() isCurrent: boolean = false;
  @Output() onLike = new EventEmitter<void>();

  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;

  reelsService = inject(SocialReelFacade);
  private cdr = inject(ChangeDetectorRef);

  paused: boolean = false;
  aspectRatio = 9 / 16;
  showControls: boolean = false;
  progressValue: number = 0;
  isSeeking: boolean = false;
  private clickTimeout: any;
  /** Timer tự động ẩn controls sau 3 giây */
  private hideControlsTimer: any;
  /** URL đã set cho video, tránh set lại cùng URL */
  private currentSrc: string = '';
  /** HLS.js instance */
  private hls: Hls | null = null;

  ngAfterViewInit(): void {
    const video = this.videoPlayerRef?.nativeElement;
    if (!video) return;

    if (this.reel?.videoUrl && this.reel.videoUrl !== this.currentSrc) {
      this.loadVideoSrc(video, this.reel.videoUrl);
    }

    if (this.isCurrent) {
      video.play().catch(() => { /* Autoplay policy */ });
      this.paused = false;
    }
  }

  private updateAspectRatio(): void {
    const source = this.reel ?? {};
    const width = Number(source.width ?? source.videoWidth ?? source.frameWidth);
    const height = Number(source.height ?? source.videoHeight ?? source.frameHeight);
    const reportedRatio = Number(source.aspectRatio ?? source.ratio);
    const ratio = width > 0 && height > 0
      ? width / height
      : reportedRatio > 0
        ? reportedRatio
        : 9 / 16;

    this.aspectRatio = ratio > 1.05 ? 16 / 9 : ratio >= 0.7 ? 4 / 5 : 9 / 16;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reel']) {
      this.updateAspectRatio();
      const newUrl: string = changes['reel'].currentValue?.videoUrl ?? '';
      if (newUrl && newUrl !== this.currentSrc) {
        const video = this.videoPlayerRef?.nativeElement;
        if (video) {
          this.loadVideoSrc(video, newUrl);
          if (this.isCurrent) {
            video.play().catch(() => { });
            this.paused = false;
          }
        }
      }
    }

    if (changes['isCurrent']) {
      const video = this.videoPlayerRef?.nativeElement;
      if (this.isCurrent) {
        if (video && video.paused) {
          video.play().catch(() => { /* Autoplay policy */ });
          this.paused = false;
        }
      } else {
        if (video && !video.paused) {
          video.pause();
          this.paused = true;
        }
        this.showControls = false;
        this.clearHideTimer();
      }
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroyHls();
    this.clearHideTimer();
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
  }

  /**
   * Load a video URL — uses HLS.js for .m3u8 streams, native src for others.
   */
  private loadVideoSrc(video: HTMLVideoElement, url: string): void {
    this.currentSrc = url;

    const isHls = url.includes('.m3u8');

    if (isHls) {
      if (Hls.isSupported()) {
        this.destroyHls();
        this.hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          // Buffer settings optimized for short-form video
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });
        this.hls.loadSource(url);
        this.hls.attachMedia(video);
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (this.isCurrent) {
            video.play().catch(() => { });
          }
        });
        this.hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal || data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            console.error('[HLS] Error:', data.type, data.details);
            console.log(this.reel);
            if (this.reel?.fallbackUrl) {
              console.log('[HLS] Falling back to regular video', this.reel.fallbackUrl);
              this.destroyHls();
              video.src = this.reel.fallbackUrl;
              video.load();
              if (this.isCurrent) {
                video.play().catch(() => { });
              }
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = url;
        video.onerror = () => {
          if (this.reel?.fallbackUrl) {
            console.log('[HLS] Falling back to regular video', this.reel.fallbackUrl);
            video.src = this.reel.fallbackUrl;
            video.load();
            if (this.isCurrent) {
              video.play().catch(() => { });
            }
          }
        };
        video.load();
      }
    } else {
      // Regular mp4/webm
      this.destroyHls();
      video.src = url;
      video.load();
    }
  }

  private destroyHls(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  handleVideoClick(videoElement: HTMLVideoElement) {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
      if (this.isCurrent) {
        this.onLike.emit();
      }
    } else {
      this.clickTimeout = setTimeout(() => {
        if (this.isCurrent) {
          if (this.showControls) {
            this.showControls = false;
            this.clearHideTimer();
          } else {
            this.showControls = true;
            this.startHideTimer();
          }
          this.cdr.markForCheck();
        }
        this.clickTimeout = null;
      }, 250);
    }
  }

  seek(videoElement: HTMLVideoElement, amount: number, event: Event) {
    event.stopPropagation();
    if (videoElement && videoElement.duration) {
      videoElement.currentTime = Math.max(0, Math.min(videoElement.currentTime + amount, videoElement.duration));
    }
    this.startHideTimer();
  }

  togglePlayPauseFromControl(videoElement: HTMLVideoElement, event: Event) {
    event.stopPropagation();
    this.togglePlayPause(videoElement);
    this.startHideTimer();
  }

  onTimeUpdate(videoElement: HTMLVideoElement) {
    if (this.isSeeking) return;
    if (videoElement && videoElement.duration && !isNaN(videoElement.duration)) {
      this.progressValue = (videoElement.currentTime / videoElement.duration) * 100;
      this.cdr.markForCheck();
    }
  }

  onSeekStart(event: Event) {
    event.stopPropagation();
    this.isSeeking = true;
  }

  onSeek(videoElement: HTMLVideoElement, event: Event) {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    if (videoElement && videoElement.duration && !isNaN(videoElement.duration)) {
      const targetTime = (value / 100) * videoElement.duration;
      this.progressValue = value;
      videoElement.currentTime = targetTime;
    }
  }

  onSeekEnd(videoElement: HTMLVideoElement, event: Event) {
    event.stopPropagation();
    setTimeout(() => {
      this.isSeeking = false;
    }, 200);
  }

  onTimelinePointerDown(event: PointerEvent, videoElement: HTMLVideoElement): void {
    event.preventDefault();
    event.stopPropagation();
    this.isSeeking = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.updateTimelineFromPointer(event, videoElement);
  }

  onTimelinePointerMove(event: PointerEvent, videoElement: HTMLVideoElement): void {
    if (!this.isSeeking) return;
    event.preventDefault();
    event.stopPropagation();
    this.updateTimelineFromPointer(event, videoElement);
  }

  onTimelinePointerUp(event: PointerEvent): void {
    event.stopPropagation();
    this.isSeeking = false;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }

  private updateTimelineFromPointer(event: PointerEvent, videoElement: HTMLVideoElement): void {
    if (!videoElement.duration || isNaN(videoElement.duration)) return;
    const timeline = event.currentTarget as HTMLElement;
    const bounds = timeline.getBoundingClientRect();
    const value = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    this.progressValue = value;
    videoElement.currentTime = (value / 100) * videoElement.duration;
    this.cdr.markForCheck();
  }

  togglePlayPause(videoElement?: HTMLVideoElement) {
    if (videoElement && typeof videoElement.play === 'function') {
      if (videoElement.paused) {
        videoElement.play();
        this.paused = false;
      } else {
        videoElement.pause();
        this.paused = true;
      }
    } else {
      this.paused = !this.paused;
    }
  }

  // ─── Controls auto-hide timer ─────────────────────────────────

  private startHideTimer(): void {
    this.clearHideTimer();
    this.hideControlsTimer = setTimeout(() => {
      this.showControls = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  private clearHideTimer(): void {
    if (this.hideControlsTimer) {
      clearTimeout(this.hideControlsTimer);
      this.hideControlsTimer = null;
    }
  }
}
