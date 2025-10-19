using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.DetailInventories;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DetailInventoriesController : ControllerBase
    {
        private readonly IDetailInventoryService _service;

        public DetailInventoriesController(IDetailInventoryService service)
        {
            _service = service;
        }

        // GET: /api/detail-inventories?isActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DetailInventoryReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var result = await _service.GetAllAsync(isActive);
            return Ok(result);
        }

        // GET: /api/detail-inventories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DetailInventoryReadDto>> GetById(int id)
        {
            var detail = await _service.GetByIdAsync(id);
            if (detail == null)
                return NotFound();

            return Ok(detail);
        }

        // GET: /api/detail-inventories/by-inventory/{inventoryId}?isActive=true
        [HttpGet("by-inventory/{inventoryId}")]
        public async Task<ActionResult<IEnumerable<DetailInventoryReadDto>>> GetByInventoryId(int inventoryId, [FromQuery] bool? isActive = true)
        {
            var result = await _service.GetByInventoryIdAsync(inventoryId, isActive);
            return Ok(result);
        }

        // POST: /api/detail-inventories
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] DetailInventoryCreateDto dto)
        {
            await _service.CreateAsync(dto);
            return Ok(new { message = "Ligne d’inventaire créée avec succès." });
        }

        // PUT: /api/detail-inventories/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] DetailInventoryUpdateDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // PUT: /api/detail-inventories/{id}/set-active?value=false
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
