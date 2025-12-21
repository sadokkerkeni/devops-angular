using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Models.Roles;
using PfeProject.Domain.Entities;
using PfeProject.Application.Interfaces;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using System;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // ✅ Only administrators can manage role definitions
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        // ✅ GET /api/role/test - Simple test endpoint
        [HttpGet("test")]
        public IActionResult TestRoles()
        {
            return Ok(new List<RoleDto>
            {
                new RoleDto { Id = 1, Name = "Admin" },
                new RoleDto { Id = 2, Name = "User" }
            });
        }

        // ✅ GET /api/role
        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            try
            {
                // Get current user's company ID from JWT token
                var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
                {
                    return Unauthorized(new { message = "Company ID not found in token" });
                }

                // Get roles for the current company (includes global roles with CompanyId = null)
                var roles = await _roleService.GetAllByCompanyAsync(companyId);

                var result = roles.Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving roles", error = ex.Message });
            }
        }

        // ✅ GET /api/role/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRole(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var role = await _roleService.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (role == null)
                return NotFound(new { message = "Rôle introuvable ❌" });

            return Ok(new RoleDto { Id = role.Id, Name = role.Name });
        }

        // ✅ POST /api/role
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var role = new Role { Name = request.Name };
            await _roleService.AddForCompanyAsync(role, companyId); // 🏢 Use company-aware method
            return Ok(new { message = "Rôle ajouté avec succès ✅" });
        }

        // ✅ PUT /api/role/{id}/update-role-name — modification du nom
        [HttpPut("{id}/update-role-name")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var role = await _roleService.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (role == null)
                return NotFound(new { message = "Rôle introuvable ❌" });

            role.Name = request.Name;
            await _roleService.UpdateAsync(role);
            return Ok(new { message = "Rôle modifié avec succès ✅" });
        }

        // ✅ DELETE /api/role/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var companyId = GetCurrentUserCompanyId(); // 🏢 Get company ID
            var role = await _roleService.GetByIdAndCompanyAsync(id, companyId); // 🏢 Use company-aware method
            if (role == null)
                return NotFound(new { message = "Rôle introuvable ❌" });

            await _roleService.DeleteAsync(id);
            return Ok(new { message = "Rôle supprimé ✅" });
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
