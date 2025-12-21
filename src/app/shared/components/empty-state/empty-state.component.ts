import { Component, Input, ViewEncapsulation, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Empty State Component
 * 
 * A standardized empty state component for displaying when no data is available.
 * Supports custom icons, titles, descriptions, and action buttons.
 * 
 * @example
 * ```html
 * <app-empty-state
 *   icon="inventory_2"
 *   title="No items found"
 *   description="Start by creating your first item"
 *   [actionLabel]="'Create Item'"
 *   (action)="onCreate()">
 * </app-empty-state>
 * ```
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmptyStateComponent {
  /**
   * Icon name (Material icon or SVG icon)
   */
  @Input() icon: string = 'inbox';

  /**
   * Icon size
   */
  @Input() iconSize: 'small' | 'medium' | 'large' = 'large';

  /**
   * Title text
   */
  @Input() title: string = 'Aucun élément trouvé';

  /**
   * Description text
   */
  @Input() description: string = 'Commencez par créer votre premier élément.';

  /**
   * Action button label
   */
  @Input() actionLabel: string = '';

  /**
   * Whether to show the action button
   */
  @Input() showAction: boolean = true;

  /**
   * Action button color
   */
  @Input() actionColor: 'primary' | 'accent' | 'warn' = 'primary';

  /**
   * Event emitted when action button is clicked
   */
  @Input() action: () => void = () => {};

  /**
   * Custom content template
   */
  @Input() customContent: TemplateRef<any> | null = null;

  /**
   * Icon size class
   */
  get iconSizeClass(): string {
    switch (this.iconSize) {
      case 'small': return 'icon-size-12';
      case 'medium': return 'icon-size-16';
      default: return 'icon-size-20';
    }
  }

  /**
   * Handle action button click
   */
  onActionClick(): void {
    if (this.action) {
      this.action();
    }
  }
}

