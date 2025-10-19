using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Services;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DetailPicklistsController : ControllerBase
    {
        private readonly IDetailPicklistService _service;
        private readonly ISapService _sapService;

        public DetailPicklistsController(IDetailPicklistService service, ISapService sapService)
        {
            _service = service;
            _sapService = sapService;
        }

        // ✅ GET /api/detailpicklists?isActive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DetailPicklistReadDto>>> GetAll([FromQuery] bool? isActive = true)
        {
            var result = await _service.GetAllAsync(isActive);
            return Ok(result);
        }

        // ✅ GET /api/detailpicklists/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DetailPicklistReadDto>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // ✅ POST /api/detailpicklists
        [HttpPost]
        public async Task<ActionResult<DetailPicklistReadDto>> Create([FromBody] DetailPicklistCreateDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return Ok(created);
        }

        // ✅ PUT /api/detailpicklists/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] DetailPicklistUpdateDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success)
                return NotFound();

            return NoContent();
        }

        // ✅ PUT /api/detailpicklists/{id}/set-active?value=true/false
        [HttpPut("{id}/set-active")]
        public async Task<IActionResult> SetActiveStatus(int id, [FromQuery] bool value)
        {
            var success = await _service.SetActiveStatusAsync(id, value);
            if (!success)
                return NotFound();

            return NoContent();
        }
        // GET /api/detailpicklists/by-picklist/{picklistId}
        [HttpGet("by-picklist/{picklistId}")]
        public async Task<ActionResult<IEnumerable<DetailPicklistReadDto>>> GetByPicklistId(int picklistId)
        {
            var details = await _service.GetByPicklistIdAsync(picklistId);
            return Ok(details);
        }

        // ✅ NEW: POST /api/detailpicklists/check-availability
        // Checks if the quantities in a list of DetailPicklists are available in SAP
        // Expects a list of DetailPicklistReadDto or a specific DTO containing Id, Quantite, ArticleId/UsCode
        [HttpPost("check-availability")]
        public async Task<ActionResult<IEnumerable<AvailabilityResultDto>>> CheckAvailability([FromBody] IEnumerable<DetailPicklistReadDto> detailPicklistsToCheck)
        {
            if (detailPicklistsToCheck == null || !detailPicklistsToCheck.Any())
            {
                return BadRequest("La liste des détails de picklist à vérifier est vide ou invalide.");
            }

            // Fetch ALL relevant SAP data to minimize database calls
            // This assumes SapReadDto has UsCode and Quantite properties
            // You might fetch only the necessary fields or filter if the SAP table is huge
            var allSapData = await _sapService.GetAllAsync(); // Or GetAllActiveAsync() if you only check active SAP items
            var sapDictionary = allSapData
                .Where(s => s.IsActive) // Assuming SapReadDto has an IsActive property
                .GroupBy(s => s.UsCode) // Group by UsCode in case there are duplicates
                .ToDictionary(g => g.Key, g => g.First()); // Take the first one if duplicates (or sum Quantite if needed)

            var results = new List<AvailabilityResultDto>();

            foreach (var detail in detailPicklistsToCheck)
            {
                // --- Determine the CodeProduit/UsCode to check ---
                // Option 1: If DetailPicklistReadDto directly contains UsCode or CodeProduit
                // string codeProduitToCheck = detail.UsCode ?? detail.CodeProduit; 

                //Option 2: If DetailPicklistReadDto contains an Article object with CodeProduit
                 string codeProduitToCheck = detail.Article?.CodeProduit;

                // Option 3: If DetailPicklistReadDto contains ArticleId and you need to fetch Article details
                // This would require an IArticleService or similar, adding complexity.
                // For simplicity, let's assume Option 2 or that UsCode is directly on DetailPicklistReadDto

              

                int requestedQuantity;
                bool isAvailable = false;
                int availableQuantity = 0;

                // Validate quantity
                if (int.TryParse(detail.Quantite, out requestedQuantity) && requestedQuantity > 0)
                {
                    // Check SAP dictionary
                    if (sapDictionary.TryGetValue(codeProduitToCheck, out var sapItem))
                    {
                        availableQuantity = sapItem.Quantite; // Assuming SapReadDto has Quantite property
                        isAvailable = availableQuantity >= requestedQuantity;
                    }
                    else
                    {
                        // CodeProduit not found in SAP
                        isAvailable = false;
                        availableQuantity = 0;
                    }
                }
                else
                {
                    // Invalid quantity in detail picklist
                    isAvailable = false;
                    availableQuantity = 0;
                }

                results.Add(new AvailabilityResultDto
                {
                    DetailPicklistId = detail.Id, // Include ID for client-side matching
                    IsAvailable = isAvailable,
                    AvailableQuantity = availableQuantity,
                    RequestedQuantity = requestedQuantity,
                    CodeProduit = codeProduitToCheck
                });
                
            }

            return Ok(results);
        }
    

    // --- DTO for the availability check result ---
    // Define this in your Application.Models or a suitable DTO location
    public class AvailabilityResultDto
    {
        public int DetailPicklistId { get; set; } // To correlate result with input
        public bool IsAvailable { get; set; }
        public int AvailableQuantity { get; set; }
        public int RequestedQuantity { get; set; }
        public string CodeProduit { get; set; } // For debugging/info
    }

}
}
