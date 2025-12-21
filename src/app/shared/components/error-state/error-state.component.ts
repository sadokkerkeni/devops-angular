import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Error State Component
 * 
 * A standardized error state component for displaying error messages.
 * Supports custom error messages and retry actions.
 * 
 * @example
 * ```html
 * <app-error-state
 *   [message]="'Failed to load data'"
 *   [retryLabel]="'Retry'"
 *   (retry)="onRetry()">
 * </app-error-state>
 * ```
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './error-state.component.html',
  styleUrls: ['./error-state.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ErrorStateComponent {
  /**
   * Error message to display
   */
  @Input() message: string = 'Une erreur est survenue';

  /**
   * Detailed error description
   */
  @Input() details: string = '';

  /**
   * Retry button label
   */
  @Input() retryLabel: string = 'Réessayer';

  /**
   * Whether to show retry button
   */
  @Input() showRetry: boolean = true;

  /**
   * Retry action handler
   */
  @Input() retry: () => void = () => {};

  /**
   * Handle retry button click
   */
  onRetryClick(): void {
    if (this.retry) {
      this.retry();
    }
  }
}

