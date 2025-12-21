import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Modern Card Component
 * 
 * A reusable card component with consistent styling and structure.
 * Supports header, body, and footer sections with optional interactive states.
 * 
 * @example
 * ```html
 * <app-card [interactive]="true" [elevated]="true">
 *   <div card-header>
 *     <h3>Card Title</h3>
 *   </div>
 *   <div card-body>
 *     Card content goes here
 *   </div>
 *   <div card-footer>
 *     <button>Action</button>
 *   </div>
 * </app-card>
 * ```
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CardComponent {
  /**
   * Whether the card is interactive (hover effects, cursor pointer)
   */
  @Input() interactive: boolean = false;

  /**
   * Whether the card has elevated shadow
   */
  @Input() elevated: boolean = false;

  /**
   * Whether to show the top accent border on hover
   */
  @Input() showAccent: boolean = true;

  /**
   * Additional CSS classes
   */
  @Input() class: string = '';

  /**
   * Animation delay for staggered animations
   */
  @Input() animationDelay: string = '0s';
}

