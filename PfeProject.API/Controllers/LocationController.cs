using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Locations;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _service;

        public LocationsController(ILocationService service)
        {
            _service = service;
        }

        // 🔹 GET: api/locations?isActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var result = await _service.GetAllAsync(isActive);
            return Ok(result);
        }

        // 🔹 GET: api/locations/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LocationReadDto>> GetById(int id)
        {
            var location = await _service.GetByIdAsync(id);
            if (location == null)
                return NotFound();

            return Ok(location);
        }

        // 🔹 POST: api/locations
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] LocationCreateDto dto)
        {
            await _service.CreateAsync(dto);
            return Ok(new { message = "Location created successfully." });
        }

        // 🔹 PUT: api/locations/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] LocationUpdateDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // 🔹 PUT: api/locations/{id}/set-active?value=true
        [HttpPut("{id}/set-active")]
        public async Task<ActionResult> SetActiveStatus(int id, [FromQuery] bool value)
        {
            var success = await _service.SetActiveStatusAsync(id, value);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
