import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PrometheusMetricsService } from '../services/prometheus-metrics.service';

@Injectable({
  providedIn: 'root'
})
export class MetricsRouteService {
  constructor(
    private metricsService: PrometheusMetricsService,
    private router: Router
  ) {}

  async handleMetricsRoute(): Promise<string> {
    try {
      const metrics = await this.metricsService.getMetrics();
      return metrics;
    } catch (error) {
      console.error('Error generating metrics:', error);
      return `# Error generating metrics: ${error}`;
    }
  }
}
