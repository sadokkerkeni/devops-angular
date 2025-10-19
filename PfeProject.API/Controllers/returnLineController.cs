using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.ReturnLines;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
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
            var result = await _returnLineService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // ✅ GET: api/ReturnLines
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReturnLineReadDto>>> GetAll()
        {
            var result = await _returnLineService.GetAllAsync();
            return Ok(result);
        }

        // ✅ GET: api/ReturnLines/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReturnLineReadDto>> GetById(int id)
        {
            var result = await _returnLineService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ✅ PUT: api/ReturnLines/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReturnLineUpdateDto dto)
        {
            var updated = await _returnLineService.UpdateAsync(id, dto);
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
    }
}
