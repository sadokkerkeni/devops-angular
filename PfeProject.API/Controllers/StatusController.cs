using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Statuses;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            var list = await _service.GetAllAsync();
            return Ok(list);
        }

        // ✅ GET: /api/status/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StatusReadDto>> GetById(int id)
        {
            var s = await _service.GetByIdAsync(id);
            if (s == null) return NotFound();
            return Ok(s);
        }

        // ✅ POST: /api/status
        [HttpPost]
        public async Task<ActionResult<StatusReadDto>> Create(StatusCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return Ok(created);
        }
    }
}
