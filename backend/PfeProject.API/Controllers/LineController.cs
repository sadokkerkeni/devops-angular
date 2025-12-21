using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Lines;
using PfeProject.Application.Models.Picklists;
using PfeProject.Application.Services;
using System.Security.Claims;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Opérateur,Admin,Administrateur,Magasinier")] // 🏢 Added authorization
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
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var list = await _lineService.GetAllByCompanyAsync(companyId, isActive); // 🏢 Use company-aware method
            return Ok(list);
        }

        // GET: /api/lines/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LineReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var line = await _lineService.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (line == null) return NotFound();
            return Ok(line);
        }

        // POST: /api/lines
        [HttpPost]
        public async Task<ActionResult<LineReadDto>> Create([FromBody] LineCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var created = await _lineService.CreateForCompanyAsync(dto, companyId); // 🏢 Use company-aware method
            return Ok(created);
        }

        // PUT: /api/lines/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] LineUpdateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var updated = await _lineService.UpdateForCompanyAsync(id, dto, companyId); // 🏢 Use company-aware method
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
        [HttpPost("{id}/picklists")]
        public async Task<IActionResult> AssignPicklist(int id, [FromBody] AssignPicklistDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID

            // Vérifier les arguments d'entrée
            if (dto == null || dto.PicklistId <= 0)
            {
                return BadRequest(new { Message = "Invalid request data. PicklistId is required and must be greater than 0." });
            }

            // Vérifier que la ligne existe
            var line = await _lineService.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (line == null)
            {
                return NotFound(new { Message = $"Line with ID {id} not found." });
            }

            // Vérifier que la picklist existe et récupérer ses données actuelles
            var picklist = await _picklistService.GetByIdAndCompanyAsync(dto.PicklistId, companyId); // 🏢 Use company-aware method
            if (picklist == null)
            {
                return NotFound(new { Message = $"Picklist with ID {dto.PicklistId} not found." });
            }

            // Créer le DTO de mise à jour en conservant les valeurs existantes + la nouvelle LineId
            // S'assurer que toutes les propriétés obligatoires sont présentes
            var picklistUpdateDto = new PicklistUpdateDto
            {
                Name = !string.IsNullOrWhiteSpace(picklist.Name) ? picklist.Name : $"Assigned_Picklist_{dto.PicklistId}",
                Type = picklist.Type ?? "",
                Quantity = picklist.Quantity, // int now
                LineId = id, // <-- Nouvelle valeur: assigner à la ligne 'id'
                WarehouseId = picklist.WarehouseId,
                StatusId = picklist.Status?.Id ?? 1 // Gérer Status null
            };

            // Mettre à jour la picklist avec la nouvelle LineId (et autres données conservées)
            var success = await _picklistService.UpdateForCompanyAsync(dto.PicklistId, picklistUpdateDto, companyId); // 🏢 Use company-aware method
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