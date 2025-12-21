import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

export interface KpiData {
  icon: string;
  title: string;
  value: number | string;
  variation?: number;
  variationLabel?: string;
  color?: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  loading?: boolean;
  route?: string; // Navigation route when card is clicked
}

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent {
  @Input() data!: KpiData;
  @Input() clickable: boolean = true; // Control whether card is clickable
  @Output() cardClick = new EventEmitter<void>(); // Custom click event

  constructor(private router: Router) {}

  get colorClass(): string {
    switch (this.data.color) {
      case 'primary': return 'kpi-primary';
      case 'accent': return 'kpi-accent';
      case 'warn': return 'kpi-warn';
      case 'success': return 'kpi-success';
      case 'info': return 'kpi-info';
      default: return 'kpi-primary';
    }
  }

  get variationClass(): string {
    if (!this.data.variation) return '';
    return this.data.variation > 0 ? 'variation-positive' : 'variation-negative';
  }

  get variationIcon(): string {
    if (!this.data.variation) return '';
    return this.data.variation > 0 ? 'trending_up' : 'trending_down';
  }

  get isClickable(): boolean {
    return this.clickable && (!!this.data.route || this.cardClick.observers.length > 0);
  }

  get ariaLabel(): string {
    return `${this.data.title}: ${this.data.value}${this.data.variation ? ', ' + (this.data.variation > 0 ? 'up' : 'down') + ' ' + Math.abs(this.data.variation) + ' percent' : ''}`;
  }

  onClick(): void {
    if (!this.isClickable || this.data.loading) return;

    // Navigate to route if specified
    if (this.data.route) {
      this.router.navigate([this.data.route]);
    }
    
    // Emit custom click event
    this.cardClick.emit();
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isClickable) {
      event.preventDefault();
      this.onClick();
    }
  }
}

