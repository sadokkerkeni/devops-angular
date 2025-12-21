import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Loading State Component
 * 
 * A standardized loading indicator component with optional message.
 * Supports different sizes and styles.
 * 
 * @example
 * ```html
 * <app-loading-state [message]="'Loading data...'" [size]="'large'"></app-loading-state>
 * ```
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-state.component.html',
  styleUrls: ['./loading-state.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoadingStateComponent {
  /**
   * Loading message to display
   */
  @Input() message: string = 'Chargement...';

  /**
   * Size of the spinner: 'small' | 'medium' | 'large'
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Whether to show full screen overlay
   */
  @Input() fullScreen: boolean = false;

  /**
   * Spinner diameter based on size
   */
  get spinnerDiameter(): number {
    switch (this.size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  }
}

