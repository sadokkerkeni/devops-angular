using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Models.users;
using PfeProject.Application.Interfaces;
using PfeProject.Domain.Entities;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PfeProject.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UserRoleController : ControllerBase
    {
        private readonly IUserRoleService _userRoleService;

        public UserRoleController(IUserRoleService userRoleService)
        {
            _userRoleService = userRoleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var userRoles = await _userRoleService.GetAllByCompanyAsync(companyId); // 🏢 Use company-aware method
            return Ok(userRoles);
        }

        [HttpGet("{userId}/{roleId}")]
        public async Task<IActionResult> Get(int userId, int roleId)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var userRole = await _userRoleService.GetByIdAndCompanyAsync(userId, roleId, companyId); // 🏢 Use company-aware method
            if (userRole == null)
                return NotFound();

            return Ok(userRole);
        }

        [HttpPost]
        public async Task<IActionResult> AssignRole([FromBody] AssignUserRoleDto assignDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors
            }

            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            
            // Map DTO to Domain Entity (or let the service handle this)
            var userRoleToAssign = new UserRole
            {
                UserId = assignDto.UserId,
                RoleId = assignDto.RoleId,
                AssignedById = assignDto.AssignedById, 
                Note = assignDto.Note,
                IsActive = true,
                AssignmentDate = DateTime.UtcNow 
            };

            try
            {
                await _userRoleService.AddForCompanyAsync(userRoleToAssign, companyId); // 🏢 Use company-aware method
                return Ok(new { message = "Rôle assigné à l'utilisateur ✅" });
            }
            catch (Exception ex) 
            {
                // Log the exception details here for debugging
                // _logger.LogError(ex, "Error assigning role");

                // Return a user-friendly error message
                // You might want to differentiate between "not found" and "conflict" etc.
                return StatusCode(500, new { message = "Erreur interne lors de l'assignation du rôle ❌", details = ex.Message }); // Or just a generic message
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateUserRole([FromBody] UserRole userRole)
        {
            await _userRoleService.UpdateAsync(userRole);
            return Ok(new { message = "Lien utilisateur-rôle mis à jour ✅" });
        }

        [HttpDelete("{userId}/{roleId}")]
        public async Task<IActionResult> RemoveRole(int userId, int roleId)
        {
            await _userRoleService.DeleteAsync(userId, roleId);
            return Ok(new { message = "Rôle retiré de l'utilisateur ✅" });
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
