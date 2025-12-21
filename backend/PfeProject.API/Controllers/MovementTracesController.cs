using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.MovementTraces;
using System.Security.Claims;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // ✅ All authenticated users can access this controller
    public class MovementTracesController : ControllerBase
    {
        private readonly IMovementTraceService _service;

        public MovementTracesController(IMovementTraceService service)
        {
            _service = service;
        }

        // ✅ GET: /api/movementtraces?isActive=true
        [HttpGet]
        // ✅ No role restriction - all authenticated users can read movement traces
        public async Task<ActionResult<IEnumerable<MovementTraceReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var traces = await _service.GetAllByCompanyAsync(companyId, isActive); // 🏢 Use company-aware method
            return Ok(traces);
        }

        // ✅ GET: /api/movementtraces/{id}
        [HttpGet("{id}")]
        // ✅ No role restriction - all authenticated users can read movement trace details
        public async Task<ActionResult<MovementTraceReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var trace = await _service.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (trace == null) return NotFound();

            return Ok(trace);
        }

        // ✅ POST: /api/movementtraces
        [HttpPost]
        [Authorize(Roles = "Magasinier,Admin,Administrateur")] // 🔒 Magasinier, Admin, and Administrateur can create
        public async Task<ActionResult<MovementTraceReadDto>> Create([FromBody] MovementTraceCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var created = await _service.CreateForCompanyAsync(dto, companyId); // 🏢 Use company-aware method
            return Ok(created);
        }

        // ✅ PUT: /api/movementtraces/{id}/set-active?value=true
        [HttpPut("{id}/set-active")]
        [Authorize(Roles = "Magasinier,Admin,Administrateur")] // 🔒 Magasinier, Admin, and Administrateur can change status
        public async Task<IActionResult> SetActive(int id, [FromQuery] bool value)
        {
            var success = await _service.SetActiveStatusAsync(id, value);
            if (!success) return NotFound();

            return NoContent();
        }

        [HttpPost("{id:int}/return-and-add-stock")]
        [Authorize(Roles = "Magasinier,Admin,Administrateur")] // 🔒 Magasinier, Admin, and Administrateur can create returns
        public async Task<IActionResult> CreateReturnLineAndAddStock(int id, [FromBody] int userId)
        {
            Console.WriteLine($"[MovementTracesController] Requête POST reçue pour /api/MovementTraces/{id}/return-and-add-stock avec userId: {userId}");

            // Vérifier que userId est valide
            if (userId <= 0)
            {
                Console.WriteLine($"[MovementTracesController] UserId invalide : {userId}");
                return BadRequest(new { Message = "UserId invalide." });
            }

            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            // Appeler le service applicatif avec company-aware method
            var result = await _service.CreateReturnLineAndAddStockForCompanyAsync(id, userId, companyId);

            if (result == null)
            {
                Console.WriteLine($"[MovementTracesController] Échec de CreateReturnLineAndAddStockForCompanyAsync pour MovementTrace ID {id} dans l'entreprise {companyId}.");
                return NotFound(new { Message = $"Échec de la création du retour et de la mise à jour du stock pour le MovementTrace ID {id}." });
            }

            Console.WriteLine($"[MovementTracesController] ReturnLine ID {result.Id} créé et stock mis à jour avec succès pour MovementTrace ID {id} dans l'entreprise {companyId}.");
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
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
