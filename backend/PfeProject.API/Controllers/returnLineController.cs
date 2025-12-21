using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.ReturnLines;
using System.Security.Claims;

namespace PfeProject.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Opérateur,Admin,Administrateur,Magasinier")]
    public class ReturnLinesController : ControllerBase
    {
        private readonly IReturnLineService _returnLineService;

        public ReturnLinesController(IReturnLineService returnLineService)
        {
            _returnLineService = returnLineService;
        }

        // ✅ POST: api/ReturnLines
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReturnLineCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var result = await _returnLineService.CreateForCompanyAsync(dto, companyId); // 🏢 Use company-aware method
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // ✅ GET: api/ReturnLines?excludeCompleted=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReturnLineReadDto>>> GetAll([FromQuery] bool excludeCompleted = false)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            
            if (excludeCompleted)
            {
                // Return only in-progress returns (matching dashboard filter)
                var inProgress = await _returnLineService.GetInProgressByCompanyAsync(companyId);
                return Ok(inProgress);
            }
            
            // Return all returns
            var result = await _returnLineService.GetAllByCompanyAsync(companyId); // 🏢 Use company-aware method
            return Ok(result);
        }

        // ✅ GET: api/ReturnLines/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReturnLineReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var result = await _returnLineService.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ✅ PUT: api/ReturnLines/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReturnLineUpdateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var updated = await _returnLineService.UpdateForCompanyAsync(id, dto, companyId); // 🏢 Use company-aware method
            if (!updated) return NotFound();
            return NoContent();
        }

        // ✅ DELETE: api/ReturnLines/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _returnLineService.DeleteAsync(id);
            if (!deleted) return NotFound();
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
