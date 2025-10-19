using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;

namespace PfeProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
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
        var result = await _service.GetFilteredAsync(filter);
        return Ok(result);
    }

    // GET: api/PicklistUs/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PicklistUsReadDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    // POST: api/PicklistUs
    [HttpPost]
    public async Task<ActionResult<PicklistUsReadDto>> Create(PicklistUsCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT: api/PicklistUs/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, PicklistUsUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
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
}
