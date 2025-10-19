using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Inventories;
using System.Text.Json;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoriesController : ControllerBase
    {
        private readonly IInventoryService _service;

        public InventoriesController(IInventoryService service)
        {
            _service = service;
        }

        // GET: /api/inventories?isActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var result = await _service.GetAllAsync(isActive);
            return Ok(result);
        }

        // GET: /api/inventories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryReadDto>> GetById(int id)
        {
            var inventory = await _service.GetByIdAsync(id);
            if (inventory == null)
                return NotFound();

            return Ok(inventory);
        }

        // POST: /api/inventories
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] InventoryCreateDto dto)
        {
            await _service.CreateAsync(dto);
            return Ok(new { message = "Inventory created successfully." });
        }

        // PUT: /api/inventories/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] InventoryUpdateDto dto)
        {
            Console.WriteLine($"--- Appel de Update pour l'ID: {id} ---");
            if (dto != null)
            {
                // Sérialiser le DTO en JSON pour un affichage lisible
                string dtoJson = JsonSerializer.Serialize(dto, new JsonSerializerOptions { WriteIndented = true });
                Console.WriteLine($"DTO reçu:\n{dtoJson}");
            }
            else
            {
                Console.WriteLine("DTO reçu: NULL");
            }
            Console.WriteLine("--- Fin de la journalisation du DTO ---");
            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // PUT: /api/inventories/{id}/set-active?value=true
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
