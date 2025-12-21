import { Component, Input, ViewEncapsulation, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Page Header Component
 * 
 * A standardized page header component with title, subtitle, and action buttons.
 * 
 * @example
 * ```html
 * <app-page-header
 *   title="Locations"
 *   subtitle="Manage your locations"
 *   [actionLabel]="'Create Location'"
 *   (action)="onCreate()">
 * </app-page-header>
 * ```
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PageHeaderComponent {
  /**
   * Page title
   */
  @Input() title: string = '';

  /**
   * Page subtitle/description
   */
  @Input() subtitle: string = '';

  /**
   * Primary action button label
   */
  @Input() actionLabel: string = '';

  /**
   * Primary action button icon
   */
  @Input() actionIcon: string = 'add';

  /**
   * Primary action handler
   */
  @Input() action: () => void = () => {};

  /**
   * Whether to show primary action button
   */
  @Input() showAction: boolean = true;

  /**
   * Custom header content template
   */
  @Input() customContent: TemplateRef<any> | null = null;

  /**
   * Handle primary action click
   */
  onActionClick(): void {
    if (this.action) {
      this.action();
    }
  }
}

