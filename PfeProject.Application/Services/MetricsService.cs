using Prometheus;

namespace PfeProject.Application.Services
{
    public class MetricsService
    {
        // Business metrics counters
        private static readonly Counter PicklistOperationsTotal = Metrics
            .CreateCounter("pfe_picklist_operations_total", "Total number of picklist operations", "operation_type", "status");

        private static readonly Counter ArticleOperationsTotal = Metrics
            .CreateCounter("pfe_article_operations_total", "Total number of article operations", "operation_type", "status");

        private static readonly Counter InventoryOperationsTotal = Metrics
            .CreateCounter("pfe_inventory_operations_total", "Total number of inventory operations", "operation_type", "status");

        private static readonly Counter SapOperationsTotal = Metrics
            .CreateCounter("pfe_sap_operations_total", "Total number of SAP operations", "operation_type", "status");

        private static readonly Counter UserOperationsTotal = Metrics
            .CreateCounter("pfe_user_operations_total", "Total number of user operations", "operation_type", "status");

        // Business metrics histograms for duration tracking
        private static readonly Histogram PicklistOperationDuration = Metrics
            .CreateHistogram("pfe_picklist_operation_duration_seconds", "Duration of picklist operations", "operation_type");

        private static readonly Histogram ArticleOperationDuration = Metrics
            .CreateHistogram("pfe_article_operation_duration_seconds", "Duration of article operations", "operation_type");

        private static readonly Histogram InventoryOperationDuration = Metrics
            .CreateHistogram("pfe_inventory_operation_duration_seconds", "Duration of inventory operations", "operation_type");

        // Business metrics gauges for current state
        private static readonly Gauge ActivePicklistsCount = Metrics
            .CreateGauge("pfe_active_picklists_count", "Number of active picklists");

        private static readonly Gauge ActiveArticlesCount = Metrics
            .CreateGauge("pfe_active_articles_count", "Number of active articles");

        private static readonly Gauge ActiveUsersCount = Metrics
            .CreateGauge("pfe_active_users_count", "Number of active users");

        private static readonly Gauge DatabaseConnectionsCount = Metrics
            .CreateGauge("pfe_database_connections_count", "Number of active database connections");

        // Method to track picklist operations
        public static void TrackPicklistOperation(string operationType, string status)
        {
            PicklistOperationsTotal.WithLabels(operationType, status).Inc();
        }

        public static void TrackPicklistOperationDuration(string operationType, double durationSeconds)
        {
            PicklistOperationDuration.WithLabels(operationType).Observe(durationSeconds);
        }

        // Method to track article operations
        public static void TrackArticleOperation(string operationType, string status)
        {
            ArticleOperationsTotal.WithLabels(operationType, status).Inc();
        }

        public static void TrackArticleOperationDuration(string operationType, double durationSeconds)
        {
            ArticleOperationDuration.WithLabels(operationType).Observe(durationSeconds);
        }

        // Method to track inventory operations
        public static void TrackInventoryOperation(string operationType, string status)
        {
            InventoryOperationsTotal.WithLabels(operationType, status).Inc();
        }

        public static void TrackInventoryOperationDuration(string operationType, double durationSeconds)
        {
            InventoryOperationDuration.WithLabels(operationType).Observe(durationSeconds);
        }

        // Method to track SAP operations
        public static void TrackSapOperation(string operationType, string status)
        {
            SapOperationsTotal.WithLabels(operationType, status).Inc();
        }

        // Method to track user operations
        public static void TrackUserOperation(string operationType, string status)
        {
            UserOperationsTotal.WithLabels(operationType, status).Inc();
        }

        // Methods to update gauge values
        public static void SetActivePicklistsCount(int count)
        {
            ActivePicklistsCount.Set(count);
        }

        public static void SetActiveArticlesCount(int count)
        {
            ActiveArticlesCount.Set(count);
        }

        public static void SetActiveUsersCount(int count)
        {
            ActiveUsersCount.Set(count);
        }

        public static void SetDatabaseConnectionsCount(int count)
        {
            DatabaseConnectionsCount.Set(count);
        }
    }
}
