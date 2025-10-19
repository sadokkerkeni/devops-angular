using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;


namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehousesController : ControllerBase
    {
        private readonly IWarehouseService _service;

        public WarehousesController(IWarehouseService service)
        {
            _service = service;
        }

        // GET: api/warehouses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WarehouseReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var warehouses = await _service.GetAllAsync(isActive);
            return Ok(warehouses);
        }

        // GET: api/warehouses/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<WarehouseReadDto>> GetById(int id)
        {
            var warehouse = await _service.GetByIdAsync(id);
            if (warehouse == null)
                return NotFound();

            return Ok(warehouse);
        }

        // POST: api/warehouses
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] WarehouseCreateDto dto)
        {
            await _service.CreateAsync(dto);
            return Ok(new { message = "Warehouse created successfully." });
        }

        // PUT: api/warehouses/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] WarehouseUpdateDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
