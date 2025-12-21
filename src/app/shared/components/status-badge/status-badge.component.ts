import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Status Badge Component
 * 
 * A standardized status badge component with consistent styling.
 * Supports different status types and custom colors.
 * 
 * @example
 * ```html
 * <app-status-badge [status]="'active'" [label]="'Active'"></app-status-badge>
 * <app-status-badge [status]="'inactive'" [label]="'Inactive'"></app-status-badge>
 * <app-status-badge [status]="'warning'" [label]="'Pending'"></app-status-badge>
 * ```
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatusBadgeComponent {
  /**
   * Status type: 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'neutral'
   */
  @Input() status: 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'neutral' = 'neutral';

  /**
   * Badge label text
   */
  @Input() label: string = '';

  /**
   * Custom color (overrides status color)
   */
  @Input() color: string = '';

  /**
   * Get badge CSS class based on status
   */
  get badgeClass(): string {
    if (this.color) {
      return 'badge-custom';
    }
    return `badge-${this.status}`;
  }

  /**
   * Get custom color style if provided
   */
  get customColorStyle(): { [key: string]: string } {
    if (this.color) {
      return { 'background-color': this.color };
    }
    return {};
  }
}

