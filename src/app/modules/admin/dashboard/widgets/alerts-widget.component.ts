import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

interface Alert {
  id: number;
  type: 'warning' | 'success' | 'error' | 'info';
  icon: string;
  title: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-alerts-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatListModule],
  template: `
    <div class="alerts-widget">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div *ngFor="let i of [1,2,3,4]" class="alert-skeleton">
          <div class="skeleton-icon"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-message"></div>
          </div>
        </div>
      </div>

      <!-- Alerts List -->
      <div *ngIf="!loading && alerts.length > 0" class="alerts-list">
        <div *ngFor="let alert of alerts" 
             class="alert-item"
             [ngClass]="'alert-' + alert.type">
          <div class="alert-icon-wrapper">
            <mat-icon class="alert-icon">{{ alert.icon }}</mat-icon>
          </div>
          <div class="alert-content">
            <h4 class="alert-title">{{ alert.title }}</h4>
            <p class="alert-message">{{ alert.message }}</p>
            <span class="alert-time">{{ alert.time }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && alerts.length === 0" class="empty-state">
        <mat-icon class="empty-icon">notifications_none</mat-icon>
        <p class="empty-text">Aucune alerte pour le moment</p>
      </div>
    </div>
  `,
  styles: [`
    .alerts-widget {
      height: 100%;
      overflow-y: auto;
    }

    // Loading State
    .loading-state {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-skeleton {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background: #f5f5f5;

      .skeleton-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      .skeleton-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .skeleton-title {
          width: 40%;
          height: 14px;
          border-radius: 4px;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-message {
          width: 70%;
          height: 12px;
          border-radius: 4px;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    // Alerts List
    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .alert-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      border-left: 4px solid;
      background: white;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        transform: translateX(4px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      &.alert-warning {
        border-left-color: #f59e0b;
        background: linear-gradient(to right, rgba(245, 158, 11, 0.05), white);

        .alert-icon-wrapper {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
      }

      &.alert-success {
        border-left-color: #10b981;
        background: linear-gradient(to right, rgba(16, 185, 129, 0.05), white);

        .alert-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
      }

      &.alert-error {
        border-left-color: #ef4444;
        background: linear-gradient(to right, rgba(239, 68, 68, 0.05), white);

        .alert-icon-wrapper {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
      }

      &.alert-info {
        border-left-color: #3b82f6;
        background: linear-gradient(to right, rgba(59, 130, 246, 0.05), white);

        .alert-icon-wrapper {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
      }
    }

    .alert-icon-wrapper {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      .alert-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .alert-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .alert-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a202c;
        margin: 0;
      }

      .alert-message {
        font-size: 13px;
        color: #718096;
        margin: 0;
        line-height: 1.4;
      }

      .alert-time {
        font-size: 11px;
        color: #a0aec0;
        margin-top: 4px;
      }
    }

    // Empty State
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #cbd5e0;
        margin-bottom: 16px;
      }

      .empty-text {
        font-size: 14px;
        color: #a0aec0;
        margin: 0;
      }
    }
  `]
})
export class AlertsWidgetComponent implements OnInit {
  loading = true;
  alerts: Alert[] = [];

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    // Simulate API call
    setTimeout(() => {
      this.alerts = [
        {
          id: 1,
          type: 'warning',
          icon: 'warning',
          title: 'Stock critique',
          message: 'Article ART-012 en dessous du seuil minimum',
          time: 'Il y a 15 min'
        },
        {
          id: 2,
          type: 'success',
          icon: 'check_circle',
          title: 'Pickliste livrée',
          message: 'PKL-045 a été livrée avec succès',
          time: 'Il y a 1h'
        },
        {
          id: 3,
          type: 'error',
          icon: 'error',
          title: 'Retour urgent',
          message: 'RET-089 nécessite une intervention immédiate',
          time: 'Il y a 2h'
        },
        {
          id: 4,
          type: 'info',
          icon: 'info',
          title: 'Nouveau mouvement',
          message: 'Réception de 250 unités de ART-034',
          time: 'Il y a 3h'
        },
        {
          id: 5,
          type: 'warning',
          icon: 'pending',
          title: 'Pickliste en attente',
          message: 'PKL-078 attend validation depuis 4h',
          time: 'Il y a 4h'
        }
      ];
      this.loading = false;
    }, 1000);
  }
}

