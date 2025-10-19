# Prometheus Integration with PFE .NET API

This document explains how Prometheus monitoring is integrated into the PFE .NET API and how to use it.

## Overview

Prometheus is a powerful monitoring and alerting toolkit that collects metrics from your applications. The PFE API now includes:

- **Built-in HTTP metrics**: Request count, duration, status codes
- **Custom business metrics**: Track operations on articles, picklists, inventory, etc.
- **System metrics**: Database connections, active users, etc.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   .NET API      │    │   Prometheus    │    │    Grafana      │
│   Port: 5288    │───▶│   Port: 9090    │───▶│   Port: 3000    │
│   /metrics      │    │   Scrapes API   │    │   Visualizes    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Start the Services

```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5433)
- .NET API (port 5288)
- Prometheus (port 9090)
- Grafana (port 3000)

### 2. Access the Services

- **API Swagger**: http://localhost:5288/swagger
- **API Metrics**: http://localhost:5288/metrics
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

### 3. View Metrics

1. **Direct API metrics**: Visit http://localhost:5288/metrics
2. **Prometheus UI**: Visit http://localhost:9090 and explore the metrics
3. **Grafana dashboards**: Visit http://localhost:3000 and create dashboards

## Available Metrics

### Built-in HTTP Metrics

These are automatically collected by the `prometheus-net.AspNetCore` package:

- `http_requests_total`: Total HTTP requests
- `http_request_duration_seconds`: HTTP request duration
- `http_requests_in_progress`: Current HTTP requests in progress

### Custom Business Metrics

These are defined in `MetricsService.cs`:

#### Counters
- `pfe_article_operations_total`: Article operations (create, read, update, delete)
- `pfe_picklist_operations_total`: Picklist operations
- `pfe_inventory_operations_total`: Inventory operations
- `pfe_sap_operations_total`: SAP operations
- `pfe_user_operations_total`: User operations

#### Histograms
- `pfe_article_operation_duration_seconds`: Duration of article operations
- `pfe_picklist_operation_duration_seconds`: Duration of picklist operations
- `pfe_inventory_operation_duration_seconds`: Duration of inventory operations

#### Gauges
- `pfe_active_articles_count`: Number of active articles
- `pfe_active_picklists_count`: Number of active picklists
- `pfe_active_users_count`: Number of active users
- `pfe_database_connections_count`: Number of database connections

## Using Metrics in Controllers

Here's how to add metrics to your controllers:

```csharp
using PfeProject.Application.Services;
using System.Diagnostics;

[HttpGet]
public async Task<ActionResult<IEnumerable<ArticleReadDto>>> GetAll()
{
    var stopwatch = Stopwatch.StartNew();
    try
    {
        var articles = await _service.GetAllAsync();
        MetricsService.TrackArticleOperation("get_all", "success");
        return Ok(articles);
    }
    catch (Exception ex)
    {
        MetricsService.TrackArticleOperation("get_all", "error");
        throw;
    }
    finally
    {
        stopwatch.Stop();
        MetricsService.TrackArticleOperationDuration("get_all", stopwatch.Elapsed.TotalSeconds);
    }
}
```

## Prometheus Configuration

The `prometheus.yml` file configures what metrics to scrape:

```yaml
scrape_configs:
  - job_name: 'pfe-api'
    static_configs:
      - targets: ['api:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s
```

## Grafana Dashboards

### Creating a Dashboard

1. Go to http://localhost:3000
2. Login with admin/admin
3. Click "Create" → "Dashboard"
4. Add panels with Prometheus queries

### Useful Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Article operations
rate(pfe_article_operations_total[5m])

# Active articles count
pfe_active_articles_count
```

## Monitoring Best Practices

### 1. Key Metrics to Monitor

- **Availability**: HTTP request success rate
- **Performance**: Response time percentiles (p50, p95, p99)
- **Errors**: Error rate and types
- **Business**: Key business operations (articles created, picklists processed)

### 2. Alerting Rules

Create alerting rules in Prometheus for:
- High error rate (> 5%)
- High response time (> 2 seconds)
- Service down
- Database connection issues

### 3. Dashboard Organization

- **Overview**: High-level system health
- **API Performance**: Request rates, response times, errors
- **Business Metrics**: Article operations, user activity
- **Infrastructure**: Database, memory, CPU usage

## Troubleshooting

### Common Issues

1. **Metrics endpoint not accessible**
   - Check if `/metrics` endpoint is mapped in Program.cs
   - Verify Prometheus configuration

2. **No metrics in Prometheus**
   - Check Prometheus targets: http://localhost:9090/targets
   - Verify API is accessible from Prometheus container

3. **Custom metrics not showing**
   - Ensure MetricsService is properly imported
   - Check metric names and labels

### Debugging

```bash
# Check if API is running
curl http://localhost:5288/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check specific metric
curl "http://localhost:9090/api/v1/query?query=pfe_article_operations_total"
```

## Next Steps

1. **Add more custom metrics** to other controllers
2. **Create Grafana dashboards** for your specific use cases
3. **Set up alerting** for critical metrics
4. **Add PostgreSQL metrics** using postgres_exporter
5. **Add system metrics** using node_exporter

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [prometheus-net Documentation](https://github.com/prometheus-net/prometheus-net)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)

