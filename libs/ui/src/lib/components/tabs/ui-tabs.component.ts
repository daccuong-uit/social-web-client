import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  signal,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface UiTab {
  id: string;
  label: string;
  count?: number;
  link?: string;
}

export type TabItem = UiTab;

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './ui-tabs.component.html',
  styleUrls: ['./ui-tabs.component.css']
})
export class UiTabsComponent implements AfterViewInit, OnChanges {
  @Input() tabs: UiTab[] = [];
  @Input() activeTabId: string | null = '';
  @Output() tabChange = new EventEmitter<any>();

  @ViewChild('track') trackRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('tabRef') tabElements!: QueryList<ElementRef<HTMLElement>>;

  canScrollLeft = signal<boolean>(false);
  canScrollRight = signal<boolean>(false);
  indicator = signal<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tabs'] && this.tabs?.length > 0 && !this.activeTabId) {
      this.activeTabId = this.tabs[0].id;
    }
    this.updateIndicator();
  }

  ngAfterViewInit(): void {
    if (this.tabs?.length > 0 && !this.activeTabId) {
      this.activeTabId = this.tabs[0].id;
    }
    setTimeout(() => {
      this.checkScroll();
      this.updateIndicator();
    }, 0);
  }

  onTabActivate(tab: UiTab, event?: Event): void {
    this.activeTabId = tab.id;
    this.tabChange.emit(tab);

    if (this.tabs.length > 0 && tab.id === this.tabs[0].id && this.trackRef?.nativeElement) {
      this.trackRef.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
    }

    this.updateIndicator();
  }

  onTabKeydown(event: KeyboardEvent, index: number): void {
    const tabList = this.tabElements.toArray();
    let targetIndex = -1;

    if (event.key === 'ArrowRight') {
      targetIndex = (index + 1) % tabList.length;
    } else if (event.key === 'ArrowLeft') {
      targetIndex = (index - 1 + tabList.length) % tabList.length;
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = tabList.length - 1;
    }

    if (targetIndex !== -1) {
      event.preventDefault();
      const targetElement = tabList[targetIndex].nativeElement;
      targetElement.focus();
      const tabObj = this.tabs[targetIndex];
      if (tabObj) {
        this.onTabActivate(tabObj);
      }
    }
  }

  scrollBy(direction: 'left' | 'right'): void {
    if (!this.trackRef?.nativeElement) return;
    const container = this.trackRef.nativeElement;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  onTrackScroll(): void {
    this.checkScroll();
    this.updateIndicator();
  }

  checkScroll(): void {
    if (!this.trackRef?.nativeElement) return;
    const el = this.trackRef.nativeElement;
    this.canScrollLeft.set(el.scrollLeft > 2);
    this.canScrollRight.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  updateIndicator(): void {
    if (!this.tabElements || !this.trackRef?.nativeElement) return;
    const activeIndex = this.tabs.findIndex((t) => t.id === this.activeTabId);
    if (activeIndex === -1) {
      this.indicator.set({ left: 0, width: 0, visible: false });
      return;
    }

    const activeEl = this.tabElements.toArray()[activeIndex]?.nativeElement;
    if (!activeEl) {
      this.indicator.set({ left: 0, width: 0, visible: false });
      return;
    }

    const trackEl = this.trackRef.nativeElement;
    const activeRect = activeEl.getBoundingClientRect();
    const trackRect = trackEl.getBoundingClientRect();

    const left = activeRect.left - trackRect.left + trackEl.scrollLeft;
    const width = activeRect.width;

    this.indicator.set({
      left,
      width,
      visible: true
    });
  }
}