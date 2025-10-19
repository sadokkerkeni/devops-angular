using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Application.Models.Roles;
using PfeProject.Domain.Entities;
using PfeProject.Application.Services;
using System.Linq;
using System.Threading.Tasks;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // ✅ accès réservé à l'Admin
    public class RoleController : ControllerBase
    {
        private readonly RoleService _roleService;

        public RoleController(RoleService roleService)
        {
            _roleService = roleService;
        }

        // ✅ GET /api/role
        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _roleService.GetAllRolesAsync();

            var result = roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name
            }).ToList();

            return Ok(result);
        }

        // ✅ GET /api/role/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRole(int id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Rôle introuvable ❌" });

            return Ok(new RoleDto { Id = role.Id, Name = role.Name });
        }

        // ✅ POST /api/role
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            var role = new Role { Name = request.Name };
            await _roleService.AddRoleAsync(role);
            return Ok(new { message = "Rôle ajouté avec succès ✅" });
        }

        // ✅ PUT /api/role/{id}/update-role-name — modification du nom
        [HttpPut("{id}/update-role-name")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Rôle introuvable ❌" });

            role.Name = request.Name;
            await _roleService.UpdateRoleAsync(role);
            return Ok(new { message = "Rôle modifié avec succès ✅" });
        }

        // ✅ DELETE /api/role/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Rôle introuvable ❌" });

            await _roleService.DeleteRoleAsync(id);
            return Ok(new { message = "Rôle supprimé ✅" });
        }
    }
}
