using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.DetailPicklists;
using PfeProject.Application.Services;
using System.Security.Claims;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Opérateur,Admin,Administrateur,Magasinier")] // 🏢 Added authorization
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
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var result = await _service.GetAllByCompanyAsync(companyId, isActive); // 🏢 Use company-aware method
            return Ok(result);
        }

        // ✅ GET /api/detailpicklists/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DetailPicklistReadDto>> GetById(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var item = await _service.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // ✅ POST /api/detailpicklists
        [HttpPost]
        public async Task<ActionResult<DetailPicklistReadDto>> Create([FromBody] DetailPicklistCreateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var created = await _service.CreateForCompanyAsync(dto, companyId); // 🏢 Use company-aware method
            return Ok(created);
        }

        // ✅ PUT /api/detailpicklists/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] DetailPicklistUpdateDto dto)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var success = await _service.UpdateForCompanyAsync(id, dto, companyId); // 🏢 Use company-aware method
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
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var details = await _service.GetByPicklistIdAndCompanyAsync(picklistId, companyId); // 🏢 Use company-aware method
            return Ok(details);
        }

        // ✅ Enhanced: POST /api/detailpicklists/check-availability
        // Checks inventory availability for picklist details with better error handling and SAP integration
        [HttpPost("check-availability")]
        public async Task<ActionResult<IEnumerable<AvailabilityResultDto>>> CheckAvailability([FromBody] IEnumerable<DetailPicklistReadDto> detailPicklistsToCheck)
        {
            if (detailPicklistsToCheck == null || !detailPicklistsToCheck.Any())
            {
                return BadRequest(new { message = "La liste des détails de picklist à vérifier est vide ou invalide." });
            }

            var companyId = GetCurrentUserCompanyId();

            try
            {
                // Fetch SAP data for the company
                var allSapData = await _sapService.GetAllByCompanyAsync(companyId);

                // ✅ NEW: Group details by article code to aggregate quantities for duplicate articles
                var articleGroups = detailPicklistsToCheck
                    .GroupBy(d => d.Article?.CodeProduit?.Trim().ToLowerInvariant() ?? "")
                    .ToDictionary(
                        g => g.Key,
                        g => new { TotalQuantity = g.Sum(d => d.Quantite), Details = g.ToList() }
                    );

                var results = new List<AvailabilityResultDto>();

                foreach (var detail in detailPicklistsToCheck)
                {
                    string codeProduitToCheck = detail.Article?.CodeProduit ?? "";

                    if (string.IsNullOrEmpty(codeProduitToCheck))
                    {
                        results.Add(new AvailabilityResultDto
                        {
                            DetailPicklistId = detail.Id,
                            IsAvailable = false,
                            AvailableQuantity = 0,
                            RequestedQuantity = 0,
                            CodeProduit = "N/A",
                            Message = "Code produit manquant"
                        });
                        continue;
                    }

                    // ✅ NEW: Use aggregated quantity for availability check
                    var normalizedCode = codeProduitToCheck.Trim().ToLowerInvariant();
                    int requestedQuantity = detail.Quantite; // Individual line quantity
                    int totalRequestedForArticle = articleGroups.ContainsKey(normalizedCode) 
                        ? articleGroups[normalizedCode].TotalQuantity 
                        : requestedQuantity;
                    
                    bool isAvailable = false;
                    int availableQuantity = 0;
                    string message = "";

                    // Validate quantity
                    if (requestedQuantity > 0)
                    {
                        // ✅ FIXED: Check SAP availability using UsCode field instead of Article
                        // Compare Article.CodeProduit with SAP.UsCode (case-insensitive, trimmed)
                        var matchingSapEntries = allSapData
                            .Where(s => s.IsActive && 
                                   !string.IsNullOrEmpty(s.UsCode) && 
                                   s.UsCode.Trim().ToLowerInvariant() == normalizedCode)
                            .ToList();

                        if (matchingSapEntries.Any())
                        {
                            availableQuantity = matchingSapEntries.Sum(s => s.Quantite);
                            // ✅ NEW: Check against total requested quantity for this article
                            isAvailable = availableQuantity >= totalRequestedForArticle;
                            
                            if (totalRequestedForArticle > requestedQuantity)
                            {
                                // Multiple lines for same article
                                message = isAvailable ?
                                    $"Disponible ({availableQuantity} unités) [Total demandé: {totalRequestedForArticle}, cette ligne: {requestedQuantity}]" :
                                    $"Stock insuffisant (disponible: {availableQuantity}, total demandé: {totalRequestedForArticle})";
                            }
                            else
                            {
                                // Single line for this article
                                message = isAvailable ?
                                    $"Disponible ({availableQuantity} unités) [UsCode: {codeProduitToCheck}]" :
                                    $"Stock insuffisant (disponible: {availableQuantity}, demandé: {requestedQuantity})";
                            }
                        }
                        else
                        {
                            message = $"Article avec UsCode '{codeProduitToCheck}' non trouvé dans SAP";
                        }
                    }
                    else
                    {
                        message = "Quantité invalide";
                    }

                    results.Add(new AvailabilityResultDto
                    {
                        DetailPicklistId = detail.Id,
                        IsAvailable = isAvailable,
                        AvailableQuantity = availableQuantity,
                        RequestedQuantity = requestedQuantity,
                        CodeProduit = codeProduitToCheck,
                        Message = message
                    });
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la vérification de disponibilité", error = ex.Message });
            }
        }

        // ✅ NEW: GET /api/detailpicklists/by-picklist/{picklistId}/with-availability
        // Gets picklist details with real-time availability status
        [HttpGet("by-picklist/{picklistId}/with-availability")]
        public async Task<ActionResult<IEnumerable<DetailPicklistWithAvailabilityDto>>> GetByPicklistWithAvailability(int picklistId)
        {
            var companyId = GetCurrentUserCompanyId();
            var details = await _service.GetByPicklistIdAndCompanyAsync(picklistId, companyId);

            if (!details.Any())
            {
                return Ok(new List<DetailPicklistWithAvailabilityDto>());
            }

            try
            {
                // Check availability for all details
                var availabilityResults = await CheckAvailability(details);
                var availabilityDict = availabilityResults.Value?.ToDictionary(r => r.DetailPicklistId, r => r) ?? new Dictionary<int, AvailabilityResultDto>();

                var result = details.Select(detail =>
                {
                    var availability = availabilityDict.GetValueOrDefault(detail.Id);
                    return new DetailPicklistWithAvailabilityDto
                    {
                        Id = detail.Id,
                        Emplacement = detail.Emplacement,
                        Quantite = detail.Quantite,
                        Article = detail.Article,
                        Status = detail.Status,
                        PicklistId = detail.PicklistId,
                        IsActive = detail.IsActive,
                        Availability = availability ?? new AvailabilityResultDto
                        {
                            DetailPicklistId = detail.Id,
                            IsAvailable = false,
                            AvailableQuantity = 0,
                            RequestedQuantity = 0,
                            CodeProduit = detail.Article?.CodeProduit ?? "N/A",
                            Message = "Non vérifié"
                        }
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la vérification de disponibilité", error = ex.Message });
            }
        }

        // --- DTO for the availability check result ---
        public class AvailabilityResultDto
        {
            public int DetailPicklistId { get; set; }
            public bool IsAvailable { get; set; }
            public int AvailableQuantity { get; set; }
            public int RequestedQuantity { get; set; }
            public string CodeProduit { get; set; }
            public string Message { get; set; }
        }

        // --- DTO for detail picklist with availability ---
        public class DetailPicklistWithAvailabilityDto
        {
            public int Id { get; set; }
            public string Emplacement { get; set; }
            public int Quantite { get; set; }
            public PfeProject.Application.Models.DetailPicklists.ArticleDto Article { get; set; }
            public PfeProject.Application.Models.Statuses.StatusReadDto Status { get; set; }
            public int PicklistId { get; set; }
            public bool IsActive { get; set; }
            public AvailabilityResultDto Availability { get; set; }
        }

        // ✅ DELETE /api/detailpicklists/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var success = await _service.DeleteForCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (!success)
                return NotFound();

            return Ok(new { message = "Detail picklist deleted successfully." });
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
