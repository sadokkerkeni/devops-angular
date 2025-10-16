import { Injectable } from '@angular/core';
import { PrometheusMetricsService } from '../services/prometheus-metrics.service';

@Injectable({
  providedIn: 'root'
})
export class MetricsEndpointService {
  constructor(private metricsService: PrometheusMetricsService) {}

  async handleMetricsRequest(): Promise<Response> {
    try {
      const metrics = await this.metricsService.getMetrics();
      
      return new Response(metrics, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (error) {
      console.error('Error serving metrics:', error);
      return new Response('Error generating metrics', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  }
}
