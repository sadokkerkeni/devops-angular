using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Statuses;
using System.Security.Claims;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🏢 Added authorization
    public class StatusController : ControllerBase
    {
        private readonly IStatusService _service;

        public StatusController(IStatusService service)
        {
            _service = service;
        }

        // ✅ GET: /api/status
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatusReadDto>>> GetAll()
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var list = await _service.GetAllByCompanyAsync(companyId); // 🏢 Use company-aware method
            return Ok(list);
        }

        // ✅ GET: /api/status/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StatusReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var s = await _service.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (s == null) return NotFound();
            return Ok(s);
        }

        // ✅ POST: /api/status
        [HttpPost]
        public async Task<ActionResult<StatusReadDto>> Create(StatusCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var created = await _service.CreateForCompanyAsync(dto, companyId); // 🏢 Use company-aware method
            return Ok(created);
        }

        private int GetCurrentUserCompanyId() // 🏢 Helper method to get company ID from JWT
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
