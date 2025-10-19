using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Picklists;
using System.Security.Claims;
using PfeProject.Domain.Interfaces;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            var list = await _service.GetAllAsync(isActive);
            return Ok(list);
        }

        // ✅ GET: /api/picklists/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PicklistReadDto>> GetById(int id)
        {
            var picklist = await _service.GetByIdAsync(id);
            if (picklist == null) return NotFound();
            return Ok(picklist);
        }

        // ✅ POST: /api/picklists
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PicklistCreateDto dto)
        {
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            int? companyId = null;
            if (int.TryParse(companyIdClaim, out var cid)) companyId = cid;

            // find Draft status for company if available
            int? statusId = dto.StatusId;
            if (companyId.HasValue && (statusId == null || statusId == 0))
            {
                var status = (await _statusRepository.GetAllAsync())
                    .FirstOrDefault(s => s.CompanyId == companyId.Value && s.Description == "Draft");
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

            var result = await _service.CreateAsync(adjusted);
            return Ok(result);
        }

        // ✅ PUT: /api/picklists/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PicklistUpdateDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
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
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (!int.TryParse(companyIdClaim, out var companyId)) return Unauthorized();
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
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (!int.TryParse(companyIdClaim, out var companyId)) return Unauthorized();
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
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (!int.TryParse(companyIdClaim, out var companyId)) return Unauthorized();
            var completed = (await _statusRepository.GetAllAsync())
                .FirstOrDefault(s => s.CompanyId == companyId && s.Description == "Completed");
            if (completed == null) return BadRequest(new { message = "Completed status not configured" });
            var ok = await _service.SetStatusAsync(id, completed.Id);
            if (!ok) return NotFound();
            return Ok(new { message = "Picklist completed" });
        }
    }
}
