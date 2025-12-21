using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Picklists;
using System.Security.Claims;
using PfeProject.Domain.Interfaces;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Opérateur,Admin,Administrateur,Magasinier")] // 🏢 Added authorization
    public class PicklistsController : ControllerBase
    {
        private readonly IPicklistService _service;
        private readonly IStatusRepository _statusRepository;

        public PicklistsController(IPicklistService service, IStatusRepository statusRepository)
        {
            _service = service;
            _statusRepository = statusRepository;
        }

        // ✅ GET: /api/picklists?isActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PicklistReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var list = await _service.GetAllByCompanyAsync(companyId, isActive); // 🏢 Use company-aware method
            return Ok(list);
        }

        // ✅ GET: /api/picklists/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PicklistReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var picklist = await _service.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (picklist == null) return NotFound();
            return Ok(picklist);
        }

        // ✅ POST: /api/picklists
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PicklistCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID

            // find Draft status for company if available
            int? statusId = dto.StatusId;
            if (statusId == null || statusId == 0)
            {
                var status = (await _statusRepository.GetAllAsync())
                    .FirstOrDefault(s => s.CompanyId == companyId && s.Description == "Draft");
                if (status != null) statusId = status.Id;
            }

            var adjusted = new PicklistCreateDto
            {
                Name = dto.Name,
                Type = dto.Type,
                Quantity = dto.Quantity,
                LineId = dto.LineId,
                WarehouseId = dto.WarehouseId,
                StatusId = statusId ?? dto.StatusId
            };

            var result = await _service.CreateForCompanyAsync(adjusted, companyId); // 🏢 Use company-aware method
            return Ok(result);
        }

        // ✅ PUT: /api/picklists/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PicklistUpdateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var success = await _service.UpdateForCompanyAsync(id, dto, companyId); // 🏢 Use company-aware method
            if (!success) return NotFound();
            return NoContent();
        }

        // ✅ PUT: /api/picklists/{id}/set-active?value=true
        [HttpPut("{id}/set-active")]
        public async Task<IActionResult> SetActiveStatus(int id, [FromQuery] bool value)
        {
            var result = await _service.SetActiveStatusAsync(id, value);
            if (!result) return NotFound();
            return NoContent();
        }
        
        [HttpPost("{id}/ready")]
        public async Task<IActionResult> MarkReady(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var ready = (await _statusRepository.GetAllAsync())
                .FirstOrDefault(s => s.CompanyId == companyId && s.Description == "Ready");
            if (ready == null) return BadRequest(new { message = "Ready status not configured" });
            var ok = await _service.SetStatusAsync(id, ready.Id);
            if (!ok) return NotFound();
            return Ok(new { message = "Picklist marked Ready" });
        }

        [HttpPost("{id}/ship")]
        public async Task<IActionResult> StartShipping(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var shipping = (await _statusRepository.GetAllAsync())
                .FirstOrDefault(s => s.CompanyId == companyId && s.Description == "Shipping");
            if (shipping == null) return BadRequest(new { message = "Shipping status not configured" });
            var ok = await _service.SetStatusAsync(id, shipping.Id);
            if (!ok) return NotFound();
            return Ok(new { message = "Shipping started" });
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> Complete(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            
            // Get current user ID for audit trail
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            // 🚨 CRITICAL: Deduct stock BEFORE marking as completed
            Console.WriteLine($"[PicklistsController] Attempting to deduct stock for Picklist ID {id}");
            var stockDeducted = await _service.DeductStockOnCompletionAsync(id, companyId, userId);
            
            if (!stockDeducted)
            {
                Console.WriteLine($"[PicklistsController] Stock deduction failed for Picklist ID {id}");
                return BadRequest(new { message = "Failed to deduct stock. Check availability or SAP configuration." });
            }

            Console.WriteLine($"[PicklistsController] Stock deducted successfully for Picklist ID {id}");

            // Now mark as completed
            var completed = (await _statusRepository.GetAllAsync())
                .FirstOrDefault(s => s.CompanyId == companyId && s.Description == "Completed");
            if (completed == null) return BadRequest(new { message = "Completed status not configured" });
            
            var ok = await _service.SetStatusAsync(id, completed.Id);
            if (!ok) return NotFound();
            
            return Ok(new { message = "Picklist completed and stock deducted successfully" });
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
