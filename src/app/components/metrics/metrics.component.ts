import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrometheusMetricsService } from '../../services/prometheus-metrics.service';
import { MetricsRouteService } from '../../services/metrics-route.service';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metrics-container">
      <h2>Prometheus Metrics</h2>
      <div class="metrics-actions">
        <button (click)="refreshMetrics()" class="btn btn-primary">Refresh Metrics</button>
        <button (click)="toggleFormat()" class="btn btn-secondary">
          {{ showJson ? 'Show Text' : 'Show JSON' }}
        </button>
      </div>
      
      <div class="metrics-content">
        <pre *ngIf="!showJson" class="metrics-text">{{ metricsText }}</pre>
        <pre *ngIf="showJson" class="metrics-json">{{ metricsJson | json }}</pre>
      </div>
      
      <div class="metrics-info">
        <p><strong>Endpoint:</strong> <code>/metrics</code></p>
        <p><strong>Format:</strong> Prometheus text format</p>
        <p><strong>Scrape Interval:</strong> 15s (configurable)</p>
      </div>
    </div>
  `,
  styles: [`
    .metrics-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .metrics-actions {
      margin-bottom: 20px;
    }
    
    .btn {
      padding: 8px 16px;
      margin-right: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .metrics-content {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 20px;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .metrics-text, .metrics-json {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .metrics-info {
      background-color: #e9ecef;
      padding: 15px;
      border-radius: 4px;
    }
    
    .metrics-info p {
      margin: 5px 0;
    }
    
    code {
      background-color: #f1f3f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
  `]
})
export class MetricsComponent implements OnInit {
  metricsText: string = '';
  metricsJson: any = {};
  showJson: boolean = false;

  constructor(
    private metricsService: PrometheusMetricsService,
    private metricsRouteService: MetricsRouteService
  ) {}

  ngOnInit() {
    this.refreshMetrics();
  }

  async refreshMetrics() {
    try {
      this.metricsText = await this.metricsService.getMetrics();
      this.metricsJson = await this.metricsService.getMetricsAsJSON();
    } catch (error) {
      console.error('Error fetching metrics:', error);
      this.metricsText = 'Error fetching metrics';
    }
  }

  toggleFormat() {
    this.showJson = !this.showJson;
  }
}
