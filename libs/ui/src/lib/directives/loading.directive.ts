import { Directive, Input, OnDestroy, inject, effect } from '@angular/core';
import { LoadingService } from '@fe/core';

/**
 * Directive to show loading state on button/element
 * Usage: [uiLoading]="'submit-btn'" or [uiLoading]="isLoadingKey"
 * Automatically disables element and optionally shows loading indicator
 *
 * @example
 * <button [uiLoading]="'submit-btn'">Submit</button>
 * <button [uiLoading]="buttonKey$ | async">Action</button>
 */
@Directive({
  standalone: true,
  selector: '[uiLoading]',
  host: {
    '[attr.disabled]': 'isLoading ? true : null',
    '[class.is-loading]': 'isLoading',
  },
})
export class LoadingDirective implements OnDestroy {
  private loadingService = inject(LoadingService);
  private el = inject(HTMLElement);

  @Input() set uiLoading(key: string) {
    this._loadingKey = key;
    this.updateLoadingState();
  }

  private _loadingKey = '';
  isLoading = false;

  constructor() {
    effect(() => {
      if (this._loadingKey) {
        const buttonStates = this.loadingService.buttonLoading$();
        this.isLoading = !!buttonStates[this._loadingKey];
      }
    });
  }

  private updateLoadingState() {
    if (this._loadingKey) {
      const isLoading = this.loadingService.isButtonLoading(this._loadingKey);
      this.isLoading = isLoading;
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}
