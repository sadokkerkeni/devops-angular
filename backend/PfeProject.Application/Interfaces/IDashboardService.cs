using System.Collections.Generic;
using System.Threading.Tasks;
using PfeProject.Application.Models.Dashboard;

namespace PfeProject.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardKpisDto> GetKpisAsync(int companyId);
        Task<StockEvolutionDto> GetStockEvolutionAsync(int companyId, int days = 7);
        Task<ActivityDataDto> GetActivityDataAsync(int companyId, int days = 7);
        Task<TopArticlesDto> GetTopArticlesAsync(int companyId, int limit = 10);
        Task<List<AlertDto>> GetRecentAlertsAsync(int companyId, int hours = 24);
        Task<List<TimelineEventDto>> GetTimelineEventsAsync(int companyId, int hours = 24);
    }
}

