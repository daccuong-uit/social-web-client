import { Component, Input, ViewEncapsulation, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'lib-input',
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInput),
      multi: true,
    },
  ],
  styles: [`
    lib-input {
      display: block;
      width: 100%;
    }
    lib-input .input-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    lib-input label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-muted);
      margin-left: 0.25rem;
    }
    lib-input input {
      height: 3.25rem;
      width: 100%;
      border-radius: 1rem;
      padding: 0 1.25rem;
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      background: var(--color-surface-subtle);
      border: 1px solid transparent;
      color: var(--color-text-base);
      transition: all 0.2s ease;
    }
    lib-input input:focus {
      outline: none;
      background: var(--color-surface-base);
      border-color: var(--color-brand-primary);
      box-shadow: 0 0 0 4px var(--color-brand-primary / 0.1);
    }
    lib-input input::placeholder {
      color: var(--color-text-muted / 0.5);
    }
    lib-input .error-message {
      font-size: 0.75rem;
      color: var(--color-danger);
      margin-top: 0.25rem;
      margin-left: 0.25rem;
    }
  `],
  template: `
    <div class="input-wrapper">
      @if (label) {
        <label [for]="inputId">{{ label }}</label>
      }
      <input
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [ngModel]="value"
        (ngModelChange)="onModelChange($event)"
        (blur)="onTouched()"
      />
      @if (error) {
        <span class="error-message">{{ error }}</span>
      }
    </div>
  `,
})
export class UiInput implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'password' | 'email' | 'number' = 'text';
  @Input() error = '';
  @Input() disabled = false;

  inputId = `input-${Math.random().toString(36).substring(2, 9)}`;
  value: unknown = '';

  onChange: (value: unknown) => void = () => { /* no-op */ };
  onTouched: () => void = () => { /* no-op */ };

  writeValue(value: unknown): void {
    this.value = value;
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(val: unknown): void {
    this.value = val;
    this.onChange(val);
  }
}
