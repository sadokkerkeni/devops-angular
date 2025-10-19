using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovementTracesController : ControllerBase
    {
        private readonly IMovementTraceService _service;

        public MovementTracesController(IMovementTraceService service)
        {
            _service = service;
        }

        // ✅ GET: /api/movementtraces?isActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovementTraceReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var traces = await _service.GetAllAsync(isActive);
            return Ok(traces);
        }

        // ✅ GET: /api/movementtraces/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MovementTraceReadDto>> GetById(int id)
        {
            var trace = await _service.GetByIdAsync(id);
            if (trace == null) return NotFound();

            return Ok(trace);
        }

        // ✅ POST: /api/movementtraces
        [HttpPost]
        public async Task<ActionResult<MovementTraceReadDto>> Create([FromBody] MovementTraceCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return Ok(created);
        }

        // ✅ PUT: /api/movementtraces/{id}/set-active?value=true
        [HttpPut("{id}/set-active")]
        public async Task<IActionResult> SetActive(int id, [FromQuery] bool value)
        {
            var success = await _service.SetActiveStatusAsync(id, value);
            if (!success) return NotFound();

            return NoContent();
        }

        [HttpPost("{id:int}/return-and-add-stock")]
        public async Task<IActionResult> CreateReturnLineAndAddStock(int id, [FromBody] int userId) // Ou utilisez [FromQuery] si vous préférez
        {
            Console.WriteLine($"[MovementTracesController] Requête POST reçue pour /api/MovementTraces/{id}/return-and-add-stock avec userId: {userId}");

            // Vérifier que userId est valide
            if (userId <= 0)
            {
                Console.WriteLine($"[MovementTracesController] UserId invalide : {userId}");
                return BadRequest(new { Message = "UserId invalide." });
            }

            // Appeler le service applicatif
            var result = await _service.CreateReturnLineAndAddStockAsync(id, userId);

            if (result == null)
            {
                // Cela peut signifier que le MovementTrace n'existe pas,
                // que la création du ReturnLine a échoué,
                // ou que la mise à jour du stock a échoué.
                Console.WriteLine($"[MovementTracesController] Échec de CreateReturnLineAndAddStockAsync pour MovementTrace ID {id}.");
                return NotFound(new { Message = $"Échec de la création du retour et de la mise à jour du stock pour le MovementTrace ID {id}." });
            }

            Console.WriteLine($"[MovementTracesController] ReturnLine ID {result.Id} créé et stock mis à jour avec succès pour MovementTrace ID {id}.");
            // Retourner 201 Created avec l'objet créé
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            // Note : GetById est l'action pour GET /api/MovementTraces/{id}.
            // Vous pourriez vouloir rediriger vers l'action de récupération du ReturnLine
            // si vous avez un contrôleur ReturnLines avec une méthode GetById.
            // Exemple : return CreatedAtAction("GetById", "ReturnLines", new { id = result.Id }, result);
        }
    }
}
