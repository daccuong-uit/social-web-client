import { Component, inject, ElementRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TabKeepAliveService } from '@fe/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'fe-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css'],
})
export class DiscoverComponent {
  private keepAlive  = inject(TabKeepAliveService);
  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // When user re-clicks "Khám phá" while already on /home/discover
    this.keepAlive
      .refreshFor('/home/discover')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.scrollToTop());
  }

  private scrollToTop(): void {
    let el: HTMLElement | null = this.elementRef.nativeElement as HTMLElement;
    while (el) {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      el = el.parentElement;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
