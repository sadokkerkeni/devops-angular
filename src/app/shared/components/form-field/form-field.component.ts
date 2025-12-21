import { Component, Input, ViewEncapsulation, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Form Field Component
 * 
 * A standardized form field wrapper with consistent styling and validation display.
 * Wraps Angular Material form fields with enhanced styling and error handling.
 * 
 * @example
 * ```html
 * <app-form-field
 *   [label]="'Email'"
 *   [control]="emailControl"
 *   [required]="true"
 *   icon="email">
 *   <input matInput formControlName="email" type="email">
 * </app-form-field>
 * ```
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldComponent {
  /**
   * Field label
   */
  @Input() label: string = '';

  /**
   * Form control for validation
   */
  @Input() control: FormControl | null = null;

  /**
   * Whether the field is required
   */
  @Input() required: boolean = false;

  /**
   * Icon name (Material icon or SVG icon)
   */
  @Input() icon: string = '';

  /**
   * Icon position: 'prefix' | 'suffix'
   */
  @Input() iconPosition: 'prefix' | 'suffix' = 'prefix';

  /**
   * Hint text
   */
  @Input() hint: string = '';

  /**
   * Custom error messages map
   */
  @Input() errorMessages: { [key: string]: string } = {};

  /**
   * Whether to show validation errors
   */
  @Input() showErrors: boolean = true;

  /**
   * Get error message for current validation state
   */
  getErrorMessage(): string {
    if (!this.control || !this.control.errors) {
      return '';
    }

    const errors = this.control.errors;
    
    // Check custom error messages first
    for (const key in errors) {
      if (this.errorMessages[key]) {
        return this.errorMessages[key];
      }
    }

    // Default error messages
    if (errors['required']) {
      return `${this.label || 'This field'} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['pattern']) {
      return 'Invalid format';
    }

    return 'Invalid value';
  }

  /**
   * Check if field has error and is touched
   */
  hasError(): boolean {
    if (!this.showErrors || !this.control) {
      return false;
    }
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }
}

