using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.DetailInventories;
using System.Security.Claims;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // ✅ All authenticated users can access this controller
    public class DetailInventoriesController : ControllerBase
    {
        private readonly IDetailInventoryService _service;

        public DetailInventoriesController(IDetailInventoryService service)
        {
            _service = service;
        }

        // GET: /api/detail-inventories?isActive=true
        [HttpGet]
        // ✅ No role restriction - all authenticated users can read detail inventories
        public async Task<ActionResult<IEnumerable<DetailInventoryReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var result = await _service.GetAllByCompanyAsync(companyId, isActive); // 🏢 Use company-aware method
            return Ok(result);
        }

        // GET: /api/detail-inventories/{id}
        [HttpGet("{id}")]
        // ✅ No role restriction - all authenticated users can read detail inventory
        public async Task<ActionResult<DetailInventoryReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var detail = await _service.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (detail == null)
                return NotFound();

            return Ok(detail);
        }

        // GET: /api/detail-inventories/by-inventory/{inventoryId}?isActive=true
        [HttpGet("by-inventory/{inventoryId}")]
        // ✅ No role restriction - all authenticated users can read by inventory
        public async Task<ActionResult<IEnumerable<DetailInventoryReadDto>>> GetByInventoryId(int inventoryId, [FromQuery] bool? isActive = true)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var result = await _service.GetByInventoryIdAndCompanyAsync(inventoryId, companyId, isActive); // 🏢 Use company-aware method
            return Ok(result);
        }

        // POST: /api/detail-inventories
        [HttpPost]
        [Authorize(Roles = "Magasinier,Admin")] // 🔒 Only Magasinier and Admin can create
        public async Task<ActionResult> Create([FromBody] DetailInventoryCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            await _service.CreateForCompanyAsync(dto, companyId); // 🏢 Use company-aware method
            return Ok(new { message = "Ligne d'inventaire créée avec succès." });
        }

        // PUT: /api/detail-inventories/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Magasinier,Admin")] // 🔒 Only Magasinier and Admin can update
        public async Task<ActionResult> Update(int id, [FromBody] DetailInventoryUpdateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var success = await _service.UpdateForCompanyAsync(id, dto, companyId); // 🏢 Use company-aware method
            if (!success)
                return NotFound();

            return NoContent();
        }

        // PUT: /api/detail-inventories/{id}/set-active?value=false
        [HttpPut("{id}/set-active")]
        [Authorize(Roles = "Magasinier,Admin")] // 🔒 Only Magasinier and Admin can change status
        public async Task<ActionResult> SetActiveStatus(int id, [FromQuery] bool value)
        {
            var success = await _service.SetActiveStatusAsync(id, value);
            if (!success)
                return NotFound();

            return NoContent();
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
