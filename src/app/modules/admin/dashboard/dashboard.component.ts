import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KpiCardComponent, KpiData } from '../../../shared/components/kpi-card/kpi-card.component';
import { StockEvolutionChartComponent } from './charts/stock-evolution-chart.component';
import { ActivityChartComponent } from './charts/activity-chart.component';
import { TopArticlesChartComponent } from './charts/top-articles-chart.component';
import { AlertsWidgetComponent } from './widgets/alerts-widget.component';
import { TimelineWidgetComponent } from './widgets/timeline-widget.component';
import { DashboardApiService } from './dashboard-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    KpiCardComponent,
    StockEvolutionChartComponent,
    ActivityChartComponent,
    TopArticlesChartComponent,
    AlertsWidgetComponent,
    TimelineWidgetComponent,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // KPI Cards Data
  kpiCards: KpiData[] = [
    {
      icon: 'inventory_2',
      title: 'Stock Critique',
      value: 12,
      variation: -15,
      variationLabel: 'vs hier',
      color: 'warn',
      loading: true,
      route: '/inventory/critical' // Navigate to critical inventory
    },
    {
      icon: 'assignment',
      title: 'Picklists Actives',
      value: 48,
      variation: 8,
      variationLabel: 'vs hier',
      color: 'primary',
      loading: true,
      route: '/picklists/active' // Navigate to active picklists
    },
    {
      icon: 'keyboard_return',
      title: 'Retours en Cours',
      value: 7,
      variation: 3,
      variationLabel: 'nouveaux',
      color: 'accent',
      loading: true,
      route: '/returns' // Navigate to returns list
    },
    {
      icon: 'local_shipping',
      title: 'Mouvements Journée',
      value: 156,
      variation: 12,
      variationLabel: 'vs hier',
      color: 'success',
      loading: true,
      route: '/movements/today' // Navigate to today's movements
    }
  ];

  // Auto-refresh interval (30 seconds)
  refreshInterval = 30000;
  lastRefresh: Date = new Date();

  constructor(
    private dashboardApi: DashboardApiService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Load initial data
    this.loadDashboardData();

    // Auto-refresh every 30 seconds
    interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboardData(true); // Silent refresh
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(silent: boolean = false): void {
    if (!silent) {
      // Set loading state only for manual refresh
      this.kpiCards.forEach(card => card.loading = true);
    }

    this.dashboardApi.getKpis()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.kpiCards = [
            {
              icon: data.stockCritique.icon,
              title: data.stockCritique.title,
              value: data.stockCritique.value,
              variation: data.stockCritique.variation,
              variationLabel: data.stockCritique.variationLabel,
              color: data.stockCritique.color as any,
              loading: false,
              route: '/inventory/critical' // 🔧 ADDED: Keep route after data load
            },
            {
              icon: data.picklistsActives.icon,
              title: data.picklistsActives.title,
              value: data.picklistsActives.value,
              variation: data.picklistsActives.variation,
              variationLabel: data.picklistsActives.variationLabel,
              color: data.picklistsActives.color as any,
              loading: false,
              route: '/picklists/active' // 🔧 ADDED: Keep route after data load
            },
            {
              icon: data.retoursEnCours.icon,
              title: data.retoursEnCours.title,
              value: data.retoursEnCours.value,
              variation: data.retoursEnCours.variation,
              variationLabel: data.retoursEnCours.variationLabel,
              color: data.retoursEnCours.color as any,
              loading: false,
              route: '/returns' // 🔧 ADDED: Keep route after data load
            },
            {
              icon: data.mouvementsJournee.icon,
              title: data.mouvementsJournee.title,
              value: data.mouvementsJournee.value,
              variation: data.mouvementsJournee.variation,
              variationLabel: data.mouvementsJournee.variationLabel,
              color: data.mouvementsJournee.color as any,
              loading: false,
              route: '/movements/today' // 🔧 ADDED: Keep route after data load
            }
          ];
          this.lastRefresh = new Date();

          if (!silent) {
            this.snackBar.open('✅ Dashboard actualisé', '', {
              duration: 2000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des KPIs:', err);
          this.kpiCards.forEach(card => card.loading = false);

          if (!silent) {
            this.snackBar.open('❌ Erreur de chargement des données', 'Réessayer', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        }
      });
  }

  manualRefresh(): void {
    this.loadDashboardData(false);
  }
}

