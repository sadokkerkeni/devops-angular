using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        private int GetCompanyId()
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            return int.TryParse(companyIdClaim, out var companyId) ? companyId : 0;
        }

        /// <summary>
        /// Get Dashboard KPIs (4 cards: Stock Critique, Picklists Actives, Retours, Mouvements)
        /// </summary>
        [HttpGet("kpis")]
        public async Task<IActionResult> GetKpis()
        {
            var companyId = GetCompanyId();
            if (companyId == 0)
                return Unauthorized("CompanyId not found in token");

            var kpis = await _dashboardService.GetKpisAsync(companyId);
            return Ok(kpis);
        }

        /// <summary>
        /// Get Stock Evolution data for Line Chart (last 7 days by default)
        /// </summary>
        [HttpGet("stock-evolution")]
        public async Task<IActionResult> GetStockEvolution([FromQuery] int days = 7)
        {
            var companyId = GetCompanyId();
            if (companyId == 0)
                return Unauthorized("CompanyId not found in token");

            var data = await _dashboardService.GetStockEvolutionAsync(companyId, days);
            return Ok(data);
        }

        /// <summary>
        /// Get Activity Data for Bar Chart (Picklists created vs delivered)
        /// </summary>
        [HttpGet("activity")]
        public async Task<IActionResult> GetActivityData([FromQuery] int days = 7)
        {
            var companyId = GetCompanyId();
            if (companyId == 0)
                return Unauthorized("CompanyId not found in token");

            var data = await _dashboardService.GetActivityDataAsync(companyId, days);
            return Ok(data);
        }

        /// <summary>
        /// Get Top Articles for Horizontal Bar Chart
        /// </summary>
        [HttpGet("top-articles")]
        public async Task<IActionResult> GetTopArticles([FromQuery] int limit = 10)
        {
            var companyId = GetCompanyId();
            if (companyId == 0)
                return Unauthorized("CompanyId not found in token");

            var data = await _dashboardService.GetTopArticlesAsync(companyId, limit);
            return Ok(data);
        }

        /// <summary>
        /// Get Recent Alerts for Alerts Widget
        /// </summary>
        [HttpGet("alerts")]
        public async Task<IActionResult> GetRecentAlerts([FromQuery] int hours = 24)
        {
            var companyId = GetCompanyId();
            if (companyId == 0)
                return Unauthorized("CompanyId not found in token");

            var alerts = await _dashboardService.GetRecentAlertsAsync(companyId, hours);
            return Ok(alerts);
        }

        /// <summary>
        /// Get Timeline Events for Timeline Widget
        /// </summary>
        [HttpGet("timeline")]
        public async Task<IActionResult> GetTimelineEvents([FromQuery] int hours = 24)
        {
            var companyId = GetCompanyId();
            if (companyId == 0)
                return Unauthorized("CompanyId not found in token");

            var events = await _dashboardService.GetTimelineEventsAsync(companyId, hours);
            return Ok(events);
        }
    }
}

