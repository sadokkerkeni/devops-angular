using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Lines;
using PfeProject.Application.Models.Picklists;
using PfeProject.Application.Services;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LinesController : ControllerBase
    {
        private readonly ILineService _lineService;
        private readonly IPicklistService _picklistService;

        public LinesController(ILineService lineService, IPicklistService picklistService)
        {
            _lineService = lineService;
            _picklistService = picklistService;
        }

        // GET: /api/lines?isActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LineReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var list = await _lineService.GetAllAsync(isActive);
            return Ok(list);
        }

        // GET: /api/lines/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LineReadDto>> GetById(int id)
        {
            var line = await _lineService.GetByIdAsync(id);
            if (line == null) return NotFound();
            return Ok(line);
        }

        // POST: /api/lines
        [HttpPost]
        public async Task<ActionResult<LineReadDto>> Create([FromBody] LineCreateDto dto)
        {
            var created = await _lineService.CreateAsync(dto);
            return Ok(created);
        }

        // PUT: /api/lines/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] LineUpdateDto dto)
        {
            var updated = await _lineService.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        // PUT: /api/lines/{id}/set-active
        [HttpPut("{id}/set-active")]
        public async Task<IActionResult> SetActiveStatus(int id, [FromQuery] bool value)
        {
            var result = await _lineService.SetActiveStatusAsync(id, value);
            if (!result) return NotFound();
            return NoContent();
        }

        // POST: /api/lines/{id}/picklists
        // POST: /api/lines/{id}/picklists
        [HttpPost("{id}/picklists")]
        public async Task<IActionResult> AssignPicklist(int id, [FromBody] AssignPicklistDto dto)
        {
            // Vérifier les arguments d'entrée
            if (dto == null || dto.PicklistId <= 0)
            {
                return BadRequest(new { Message = "Invalid request data. PicklistId is required and must be greater than 0." });
            }

            // Vérifier que la ligne existe
            var line = await _lineService.GetByIdAsync(id);
            if (line == null)
            {
                return NotFound(new { Message = $"Line with ID {id} not found." });
            }

            // Vérifier que la picklist existe et récupérer ses données actuelles
            var picklist = await _picklistService.GetByIdAsync(dto.PicklistId);
            if (picklist == null)
            {
                return NotFound(new { Message = $"Picklist with ID {dto.PicklistId} not found." });
            }

            // --- MODIFICATION : Supprimer ou commenter la vérification de réaffectation ---
            /*
            // Vérifier si la picklist est déjà assignée à une autre ligne
            // Assumer que LineId == 0 signifie non assignée. Ajustez si la logique est différente.
            if (picklist.LineId != 0 && picklist.LineId != id)
            {
                // Log optionnel pour débogage
                Console.WriteLine($"[AssignPicklist] Picklist {dto.PicklistId} already assigned to Line {picklist.LineId}, requested Line {id}");
                return Conflict(new { Message = $"Picklist '{picklist.Name ?? "Unknown"}' is already assigned to another line (ID: {picklist.LineId})." });
            }
            */
            // --- FIN DE LA MODIFICATION ---

            // Créer le DTO de mise à jour en conservant les valeurs existantes + la nouvelle LineId
            // S'assurer que toutes les propriétés obligatoires sont présentes
            var picklistUpdateDto = new PicklistUpdateDto
            {
                Name = !string.IsNullOrWhiteSpace(picklist.Name) ? picklist.Name : $"Assigned_Picklist_{dto.PicklistId}",
                Type = picklist.Type ?? "",
                Quantity = picklist.Quantity ?? "",
                LineId = id, // <-- Nouvelle valeur: assigner à la ligne 'id'
                WarehouseId = picklist.WarehouseId,
                StatusId = picklist.Status?.Id ?? 1 // Gérer Status null
            };

            // Mettre à jour la picklist avec la nouvelle LineId (et autres données conservées)
            var success = await _picklistService.UpdateAsync(dto.PicklistId, picklistUpdateDto);
            if (!success)
            {
                Console.WriteLine($"[AssignPicklist] Failed to update Picklist {dto.PicklistId} via service.");
                return BadRequest(new { Message = "Failed to assign picklist to line due to a service error." });
            }

            Console.WriteLine($"[AssignPicklist] Successfully assigned Picklist {dto.PicklistId} to Line {id}.");
            return NoContent();
        }

        // DTO for assigning a picklist
        public class AssignPicklistDto
        {
            public int PicklistId { get; set; }
        }





    }
}