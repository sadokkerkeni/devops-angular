import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

export interface NotificationConfig {
  message: string;
  action?: string;
  duration?: number;
  horizontalPosition?: MatSnackBarHorizontalPosition;
  verticalPosition?: MatSnackBarVerticalPosition;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly defaultDuration = 4000;
  private readonly defaultHorizontalPosition: MatSnackBarHorizontalPosition = 'end';
  private readonly defaultVerticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private _snackBar: MatSnackBar) {}

  /**
   * Show success notification
   */
  success(message: string, action: string = 'OK', duration: number = this.defaultDuration): void {
    this._snackBar.open(message, action, {
      duration,
      horizontalPosition: this.defaultHorizontalPosition,
      verticalPosition: this.defaultVerticalPosition,
      panelClass: ['success-snackbar', 'modern-snackbar'],
    });
  }

  /**
   * Show error notification
   */
  error(message: string, action: string = 'Fermer', duration: number = 6000): void {
    this._snackBar.open(message, action, {
      duration,
      horizontalPosition: this.defaultHorizontalPosition,
      verticalPosition: this.defaultVerticalPosition,
      panelClass: ['error-snackbar', 'modern-snackbar'],
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, action: string = 'OK', duration: number = this.defaultDuration): void {
    this._snackBar.open(message, action, {
      duration,
      horizontalPosition: this.defaultHorizontalPosition,
      verticalPosition: this.defaultVerticalPosition,
      panelClass: ['warning-snackbar', 'modern-snackbar'],
    });
  }

  /**
   * Show info notification
   */
  info(message: string, action: string = 'OK', duration: number = this.defaultDuration): void {
    this._snackBar.open(message, action, {
      duration,
      horizontalPosition: this.defaultHorizontalPosition,
      verticalPosition: this.defaultVerticalPosition,
      panelClass: ['info-snackbar', 'modern-snackbar'],
    });
  }

  /**
   * Show custom notification
   */
  show(config: NotificationConfig): void {
    const snackBarConfig: MatSnackBarConfig = {
      duration: config.duration || this.defaultDuration,
      horizontalPosition: config.horizontalPosition || this.defaultHorizontalPosition,
      verticalPosition: config.verticalPosition || this.defaultVerticalPosition,
      panelClass: ['modern-snackbar'],
    };

    this._snackBar.open(config.message, config.action || 'OK', snackBarConfig);
  }
}

