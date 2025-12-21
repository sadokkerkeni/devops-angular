using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Inventories;
using System.Security.Claims;
using System.Text.Json;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // ✅ All authenticated users can access this controller
    public class InventoriesController : ControllerBase
    {
        private readonly IInventoryService _service;

        public InventoriesController(IInventoryService service)
        {
            _service = service;
        }

        // GET: /api/inventories?isActive=true
        [HttpGet]
        // ✅ No role restriction - all authenticated users can read inventories
        public async Task<ActionResult<IEnumerable<InventoryReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var result = await _service.GetAllByCompanyAsync(companyId, isActive); // 🏢 Use company-aware method
            return Ok(result);
        }

        // GET: /api/inventories/{id}
        [HttpGet("{id}")]
        // ✅ No role restriction - all authenticated users can read inventory details
        public async Task<ActionResult<InventoryReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var inventory = await _service.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (inventory == null)
                return NotFound();

            return Ok(inventory);
        }

        // POST: /api/inventories
        [HttpPost]
        [Authorize(Roles = "Magasinier,Admin")] // 🔒 Only Magasinier and Admin can create
        public async Task<ActionResult> Create([FromBody] InventoryCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            await _service.CreateForCompanyAsync(dto, companyId); // 🏢 Use company-aware method
            return Ok(new { message = "Inventory created successfully." });
        }

        // PUT: /api/inventories/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Magasinier,Admin")] // 🔒 Only Magasinier and Admin can update
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
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var success = await _service.UpdateForCompanyAsync(id, companyId, dto); // 🏢 Use company-aware method
            if (!success)
                return NotFound();

            return NoContent();
        }

        // PUT: /api/inventories/{id}/set-active?value=true
        [HttpPut("{id}/set-active")]
        [Authorize(Roles = "Magasinier,Admin")] // 🔒 Only Magasinier and Admin can change status
        public async Task<ActionResult> SetActiveStatus(int id, [FromQuery] bool value)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var success = await _service.SetActiveStatusAsync(id, value); // 🏢 Note: This method doesn't need company filtering as it's a simple status update
            if (!success)
                return NotFound();

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
