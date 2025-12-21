import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Promotional Header Component
 * 
 * Displays promotional/branding content at the top of pages.
 * This is Component 1 in the split-screen layout.
 */
@Component({
  selector: 'app-promotional-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './promotional-header.component.html',
  styleUrls: ['./promotional-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PromotionalHeaderComponent {
  constructor() {}
}

