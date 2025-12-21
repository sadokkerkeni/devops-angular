import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-top-articles-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="chart-wrapper">
      <canvas *ngIf="!loading && chartData" 
              baseChart
              [type]="'bar'"
              [data]="chartData"
              [options]="chartOptions">
      </canvas>
      
      <div *ngIf="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      position: relative;
      height: 300px;
      width: 100%;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      z-index: 10;

      .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #30cfd0;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }

      p {
        margin-top: 12px;
        color: #718096;
        font-size: 14px;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class TopArticlesChartComponent implements OnInit {
  loading = true;
  chartData?: ChartConfiguration<'bar'>['data'];
  
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => {
            return `Mouvements: ${context.parsed.x}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.dashboardService.getTopArticles().subscribe({
      next: (data) => {
        this.chartData = {
          labels: data.labels,
          datasets: data.datasets
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement top articles:', err);
        this.loading = false;
      }
    });
  }
}

