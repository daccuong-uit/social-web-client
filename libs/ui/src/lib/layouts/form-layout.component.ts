/**
 * Standardized Form Component Layout
 * Reusable template for forms across app (profile, settings, auth, etc.)
 * 
 * Features:
 * - Consistent spacing using design tokens
 * - Form field group layout
 * - Error/success states
 * - Submit & cancel buttons
 * - Responsive design
 * 
 * Usage:
 * ```html
 * <app-form-layout 
 *   title="Edit Profile"
 *   [isLoading]="isLoading$"
 *   (onSubmit)="handleSubmit()"
 *   (onCancel)="handleCancel()">
 *   
 *   <ng-container formFields>
 *     <div class="form-group">
 *       <label>Name</label>
 *       <input [(ngModel)]="model.name">
 *     </div>
 *   </ng-container>
 * </app-form-layout>
 * ```
 */

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiSettingsService } from '@fe/core';

@Component({
  selector: 'app-form-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-layout-container">
      <!-- Form Header -->
      <div class="form-header" *ngIf="title">
        <h2 class="form-title">{{ title }}</h2>
        <p class="form-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>

      <!-- Form Body -->
      <div class="form-body">
        <ng-content select="[formFields]"></ng-content>
      </div>

      <!-- Form Footer (Actions) -->
      <div class="form-footer">
        <ng-content select="[formActions]"></ng-content>
        
        <!-- Default actions if not provided -->
        <div *ngIf="!showCustomActions" class="form-actions">
          <button 
            type="button"
            class="btn btn-secondary"
            (click)="onCancel.emit()"
            *ngIf="showCancelButton"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="btn btn-primary"
            [disabled]="isLoading"
            (click)="onSubmit.emit()"
          >
            {{ isLoading ? 'Saving...' : submitButtonText }}
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div class="form-error" *ngIf="errorMessage">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Success Message -->
      <div class="form-success" *ngIf="successMessage">
        <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </div>
  `,
  styles: [`
    .form-layout-container {
      display: flex;
      flex-direction: column;
      gap: calc(var(--padding-scale, 1) * 1.5rem);
      padding: calc(var(--padding-scale, 1) * 1.5rem);
      background-color: var(--color-surface-base);
      border-radius: 0.75rem;
      border: 1px solid var(--color-border-subtle);
      max-width: 600px;
    }

    .form-header {
      margin-bottom: calc(var(--padding-scale, 1) * 0.5rem);
    }

    .form-title {
      font-size: calc(var(--font-size-scale, 1) * 1.75rem);
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: var(--color-text-base);
    }

    .form-subtitle {
      font-size: calc(var(--font-size-scale, 1) * 0.875rem);
      color: var(--color-text-muted);
      margin: 0;
    }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: calc(var(--padding-scale, 1) * 1rem);
    }

    .form-footer {
      margin-top: calc(var(--padding-scale, 1) * 1rem);
      padding-top: calc(var(--padding-scale, 1) * 1rem);
      border-top: 1px solid var(--color-border-subtle);
    }

    .form-actions {
      display: flex;
      gap: calc(var(--padding-scale, 1) * 1rem);
      justify-content: flex-end;
    }

    .btn {
      padding: calc(var(--padding-scale, 1) * 0.75rem) calc(var(--padding-scale, 1) * 1.5rem);
      border-radius: 0.5rem;
      border: 1px solid;
      font-size: calc(var(--font-size-scale, 1) * 1rem);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      white-space: nowrap;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background-color: var(--color-brand-primary);
      color: white;
      border-color: var(--color-brand-primary);

      &:hover:not(:disabled) {
        background-color: var(--color-brand-primary-hover);
      }
    }

    .btn-secondary {
      background-color: var(--color-btn-bg);
      color: var(--color-text-base);
      border-color: var(--color-btn-border);

      &:hover:not(:disabled) {
        background-color: var(--color-btn-hover);
      }
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: calc(var(--padding-scale, 1) * 0.75rem);
      padding: calc(var(--padding-scale, 1) * 1rem);
      background-color: rgb(var(--color-danger) / 0.05);
      border: 1px solid var(--color-danger);
      border-radius: 0.5rem;
      color: var(--color-danger);
      font-size: calc(var(--font-size-scale, 1) * 0.875rem);
    }

    .error-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    .form-success {
      display: flex;
      align-items: center;
      gap: calc(var(--padding-scale, 1) * 0.75rem);
      padding: calc(var(--padding-scale, 1) * 1rem);
      background-color: rgb(var(--color-success) / 0.05);
      border: 1px solid var(--color-success);
      border-radius: 0.5rem;
      color: var(--color-success);
      font-size: calc(var(--font-size-scale, 1) * 0.875rem);
    }

    .success-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .form-layout-container {
        padding: calc(var(--padding-scale, 1) * 1rem);
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class FormLayoutComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Input() successMessage = '';
  @Input() submitButtonText = 'Save';
  @Input() showCancelButton = true;
  @Input() showCustomActions = false;

  @Output() onSubmit = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  private settingsService = inject(UiSettingsService);
  
  // Make font scale available in template
  fontSizeMultiplier$ = this.settingsService.fontSizeMultiplier$;
  paddingMultiplier$ = this.settingsService.paddingMultiplier$;
}
