using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Articles;
using PfeProject.Application.Services;
using System.Security.Claims;
using System.Diagnostics;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ArticlesController : ControllerBase
    {
        private readonly IArticleService _service;

        public ArticlesController(IArticleService service)
        {
            _service = service;
        }

        // ✅ GET: /api/articles?isActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArticleReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var companyId = GetCurrentUserCompanyId();
                var articles = await _service.GetAllByCompanyAsync(companyId, isActive);
                
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

        // ✅ GET: /api/articles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ArticleReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId();
            var article = await _service.GetByIdAndCompanyAsync(id, companyId);
            if (article == null) return NotFound();
            return Ok(article);
        }

        // ✅ POST: /api/articles
        [HttpPost]
        public async Task<ActionResult<ArticleReadDto>> Create([FromBody] ArticleCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId();
            var created = await _service.CreateForCompanyAsync(dto, companyId);
            return Ok(created);
        }

        // ✅ PUT: /api/articles/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ArticleUpdateDto dto)
        {
            var companyId = GetCurrentUserCompanyId();
            var success = await _service.UpdateForCompanyAsync(id, dto, companyId);
            if (!success) return NotFound();
            return NoContent();
        }

        // ✅ PUT: /api/articles/5/set-active?value=false
        [HttpPut("{id}/set-active")]
        public async Task<IActionResult> SetActive(int id, [FromQuery] bool value)
        {
            var companyId = GetCurrentUserCompanyId();
            var success = await _service.SetActiveStatusForCompanyAsync(id, value, companyId);
            if (!success) return NotFound();
            return NoContent();
        }

        private int GetCurrentUserCompanyId()
        {
            var companyIdClaim = User.FindFirst("CompanyId");
            if (companyIdClaim != null && int.TryParse(companyIdClaim.Value, out int companyId))
            {
                return companyId;
            }
            throw new UnauthorizedAccessException("User company ID not found in token");
        }
    }
}
