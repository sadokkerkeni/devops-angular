using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.PicklistUSs;
using System.Security.Claims;

namespace PfeProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Opérateur,Admin")]
public class PicklistUsController : ControllerBase
{
    private readonly IPicklistUsService _service;

    public PicklistUsController(IPicklistUsService service)
    {
        _service = service;
    }

    // GET: api/PicklistUs?statusId=1&userId=2&isActive=true&nom=us
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PicklistUsReadDto>>> GetFiltered([FromQuery] PicklistUsFilterDto filter)
    {
        var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
        var result = await _service.GetFilteredByCompanyAsync(filter, companyId); // 🏢 Use company-aware method
        return Ok(result);
    }

    // GET: api/PicklistUs/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PicklistUsReadDto>> GetById(int id)
    {
        var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
        var result = await _service.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
        return result is null ? NotFound() : Ok(result);
    }

    // POST: api/PicklistUs
    [HttpPost]
    public async Task<ActionResult<PicklistUsReadDto>> Create(PicklistUsCreateDto dto)
    {
        var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
        var created = await _service.CreateForCompanyAsync(dto, companyId); // 🏢 Use company-aware method
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT: api/PicklistUs/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, PicklistUsUpdateDto dto)
    {
        var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
        var updated = await _service.UpdateForCompanyAsync(id, dto, companyId); // 🏢 Use company-aware method
        return updated ? NoContent() : NotFound();
    }

    // PUT: api/PicklistUs/status/5
    [HttpPut("status/{id}")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] PicklistUsStatusDto dto)
    {
        var result = dto.IsActive
            ? await _service.ActivateAsync(id)
            : await _service.DeactivateAsync(id);

        return result ? NoContent() : NotFound();
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
