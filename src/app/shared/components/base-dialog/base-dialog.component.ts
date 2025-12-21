import { Component, Input, ViewEncapsulation, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Base Dialog Component
 * 
 * A base dialog component that provides consistent structure and styling
 * for all dialogs in the application. Extend this component for specific dialogs.
 */
@Component({
  selector: 'app-base-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BaseDialogComponent {
  /**
   * Dialog title
   */
  @Input() title: string = '';

  /**
   * Dialog subtitle/description
   */
  @Input() subtitle: string = '';

  /**
   * Whether dialog is in loading state
   */
  @Input() loading: boolean = false;

  /**
   * Whether to show save button
   */
  @Input() showSave: boolean = true;

  /**
   * Whether to show cancel button
   */
  @Input() showCancel: boolean = true;

  /**
   * Save button label
   */
  @Input() saveLabel: string = 'Save';

  /**
   * Cancel button label
   */
  @Input() cancelLabel: string = 'Cancel';

  /**
   * Save button icon
   */
  @Input() saveIcon: string = 'save';

  /**
   * Whether save button is disabled
   */
  @Input() saveDisabled: boolean = false;

  /**
   * Custom header content
   */
  @Input() customHeader: TemplateRef<any> | null = null;

  /**
   * Custom footer content
   */
  @Input() customFooter: TemplateRef<any> | null = null;

  /**
   * Close event handler
   */
  @Input() close: () => void = () => {};

  /**
   * Save event handler
   */
  @Input() save: () => void = () => {};

  /**
   * Handle close button click
   */
  onClose(): void {
    if (!this.loading && this.close) {
      this.close();
    }
  }

  /**
   * Handle save button click
   */
  onSave(): void {
    if (!this.loading && !this.saveDisabled && this.save) {
      this.save();
    }
  }
}
