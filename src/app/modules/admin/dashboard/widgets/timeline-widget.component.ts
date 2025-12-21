import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface TimelineEvent {
  id: number;
  type: 'picklist' | 'stock' | 'return' | 'movement';
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  user?: string;
}

@Component({
  selector: 'app-timeline-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="timeline-widget">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="timeline-skeleton">
          <div class="skeleton-dot"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-desc"></div>
          </div>
        </div>
      </div>

      <!-- Timeline List -->
      <div *ngIf="!loading && events.length > 0" class="timeline-list">
        <div *ngFor="let event of events; let last = last" 
             class="timeline-item"
             [class.last]="last">
          <div class="timeline-dot" [style.background-color]="event.iconColor">
            <mat-icon class="timeline-icon">{{ event.icon }}</mat-icon>
          </div>
          <div class="timeline-line" *ngIf="!last"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h4 class="timeline-title">{{ event.title }}</h4>
              <span class="timeline-time">{{ event.time }}</span>
            </div>
            <p class="timeline-description">{{ event.description }}</p>
            <span *ngIf="event.user" class="timeline-user">
              <mat-icon class="user-icon">person</mat-icon>
              {{ event.user }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && events.length === 0" class="empty-state">
        <mat-icon class="empty-icon">timeline</mat-icon>
        <p class="empty-text">Aucun événement récent</p>
      </div>
    </div>
  `,
  styles: [`
    .timeline-widget {
      height: 100%;
      overflow-y: auto;
      padding-right: 8px;
    }

    // Loading State
    .loading-state {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .timeline-skeleton {
      display: flex;
      gap: 16px;
      position: relative;

      .skeleton-dot {
        flex-shrink: 0;
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
          width: 50%;
          height: 14px;
          border-radius: 4px;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-desc {
          width: 80%;
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

    // Timeline List
    .timeline-list {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
      padding-bottom: 32px;

      &.last {
        padding-bottom: 0;
      }
    }

    .timeline-dot {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      box-shadow: 0 0 0 4px white;

      .timeline-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: white;
      }
    }

    .timeline-line {
      position: absolute;
      left: 19px;
      top: 40px;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, #e2e8f0 0%, transparent 100%);
      z-index: 1;
    }

    .timeline-content {
      flex: 1;
      padding-top: 4px;

      .timeline-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 6px;

        .timeline-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
        }

        .timeline-time {
          font-size: 12px;
          color: #a0aec0;
          white-space: nowrap;
        }
      }

      .timeline-description {
        font-size: 13px;
        color: #718096;
        margin: 0 0 8px 0;
        line-height: 1.5;
      }

      .timeline-user {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #a0aec0;
        padding: 4px 8px;
        background: #f7fafc;
        border-radius: 12px;

        .user-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
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

    // Scrollbar styling
    .timeline-widget::-webkit-scrollbar {
      width: 6px;
    }

    .timeline-widget::-webkit-scrollbar-track {
      background: transparent;
    }

    .timeline-widget::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }

    .timeline-widget::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `]
})
export class TimelineWidgetComponent implements OnInit {
  loading = true;
  events: TimelineEvent[] = [];

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    // Simulate API call
    setTimeout(() => {
      this.events = [
        {
          id: 1,
          type: 'picklist',
          icon: 'check_circle',
          iconColor: '#10b981',
          title: 'Pickliste marquée comme prête',
          description: 'PKL-089 a été validée et est prête pour expédition',
          time: '14:30',
          user: 'Mohamed Ali'
        },
        {
          id: 2,
          type: 'stock',
          icon: 'warning',
          iconColor: '#f59e0b',
          title: 'Alerte stock critique',
          description: 'Article ART-456 est en dessous du seuil minimum (12 unités)',
          time: '13:15',
          user: 'Système'
        },
        {
          id: 3,
          type: 'return',
          icon: 'undo',
          iconColor: '#3b82f6',
          title: 'Retour traité',
          description: 'RET-023 a été traité et réintégré au stock',
          time: '12:00',
          user: 'Fatima Ben'
        },
        {
          id: 4,
          type: 'movement',
          icon: 'local_shipping',
          iconColor: '#8b5cf6',
          title: 'Nouvelle réception',
          description: 'Réception de 500 unités de ART-234 depuis le fournisseur',
          time: '10:45',
          user: 'Ahmed Karim'
        },
        {
          id: 5,
          type: 'picklist',
          icon: 'assignment',
          iconColor: '#667eea',
          title: 'Nouvelle pickliste créée',
          description: 'PKL-090 a été créée pour la ligne Production 3',
          time: '09:20',
          user: 'Sarah Tounsi'
        },
        {
          id: 6,
          type: 'stock',
          icon: 'inventory_2',
          iconColor: '#10b981',
          title: 'Inventaire mis à jour',
          description: 'Inventaire mensuel complété pour le magasin principal',
          time: '08:00',
          user: 'Youssef Mansour'
        }
      ];
      this.loading = false;
    }, 1200);
  }
}

