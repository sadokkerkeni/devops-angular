import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Table Skeleton -->
    <div *ngIf="type === 'table'" class="skeleton-table">
      <div *ngFor="let row of rowsArray" class="skeleton-row">
        <div class="skeleton-cell" *ngFor="let col of [1,2,3,4]"></div>
      </div>
    </div>

    <!-- Cards Skeleton -->
    <div *ngIf="type === 'cards'" class="skeleton-cards">
      <div *ngFor="let card of cardsArray" class="skeleton-card">
        <div class="skeleton-card-header"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>

    <!-- Custom Skeleton -->
    <div *ngIf="type === 'custom'" 
         class="skeleton-custom" 
         [style.height.px]="height"
         [style.width.%]="width">
    </div>
  `,
  styles: [`
    .skeleton-table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .skeleton-row {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
    }

    .skeleton-cell {
      flex: 1;
      height: 20px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .skeleton-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .skeleton-card-header {
      height: 60px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-card-body {
      padding: 16px;
    }

    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 12px;

      &.short {
        width: 60%;
      }
    }

    .skeleton-custom {
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'table' | 'cards' | 'custom' = 'table';
  @Input() rows: number = 5;
  @Input() count: number = 3;
  @Input() height: number = 100;
  @Input() width: number = 100;

  get rowsArray(): number[] {
    return Array(this.rows).fill(0).map((_, i) => i);
  }

  get cardsArray(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}

