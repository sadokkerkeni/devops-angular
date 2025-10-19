using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PfeProject.Domain.Interfaces;
using PfeProject.Application.Models.Users;
using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using PfeProject.Application.Models.users;

namespace PfeProject.API.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UsersManagementController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserRoleRepository _userRoleRepository;

        public UsersManagementController(IUserRepository userRepository, IUserRoleRepository userRoleRepository)
        {
            _userRepository = userRepository;
            _userRoleRepository = userRoleRepository;
        }

        [HttpGet("user-profile")]
        public async Task<IActionResult> GetCurrentUserProfile()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
                return Unauthorized(new { message = "Email introuvable ❌" });

            var user = await _userRepository
                .GetUserWithRolesByEmailAsync(email); // assure-toi qu’il inclut les rôles

            if (user == null)
                return NotFound(new { message = "Utilisateur non trouvé ❌" });

            var dto = new ProfileReadDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Matricule = user.Matricule,
                Email = user.Email,
                State = user.State,
                Roles = user.UserRoles.Select(r => r.Role.Name).ToList()
            };

            return Ok(dto);
        }

        // PUT: api/users/user-update-profile
        [HttpPut("user-update-profile")]
        public async Task<IActionResult> UpdateCurrentUserProfile([FromBody] UpdateProfileDto dto)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
                return Unauthorized(new { message = "Email introuvable dans le token ❌" });

            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "Utilisateur introuvable" });

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Matricule = dto.Matricule;
            user.Email = dto.Email;
            user.UpdateDate = DateTime.UtcNow;

            await _userRepository.UpdateUserAsync(user);
            return Ok(new { message = "Profil mis à jour ✅" });
        }

        // GET: api/users/admin-all
        [HttpGet("admin-all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsersWithRoles()
        {
            var users = await _userRepository.GetAllUsersWithRolesAsync();

            var result = users.Select(u => new UserWithRolesDto
            {
                Id = u.Id,
                Matricule = u.Matricule,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                // Populate the list of RoleInfo objects
                Roles = u.UserRoles
                    .Where(ur => ur.IsActive && ur.Role != null)
                    .Select(ur => new UserWithRolesDto.RoleInfo
                    {
                        Id = ur.Role.Id,
                        Name = ur.Role.Name
                    })
                    .ToList()
            }).ToList();

            return Ok(result);
        }

        // GET: api/users/admin-details/{id}
        [HttpGet("admin-details/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserDetails(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "Utilisateur non trouvé ❌" });

            return Ok(user);
        }

        // POST: api/users/admin-create
        [HttpPost("admin-create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminCreateUser([FromBody] UserCreateDto dto)
        {
            // Company of the acting admin creating the user
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !int.TryParse(companyIdClaim, out var companyId))
                return Unauthorized(new { message = "Company information missing in token" });

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Matricule = dto.Matricule,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreationDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                State = true,
                CompanyId = companyId
            };

            await _userRepository.AddUserAsync(user);
            return CreatedAtAction(nameof(GetUserDetails), new { id = user.Id }, user);
        }

        // PUT: api/users/admin-update/{id}
        [HttpPut("admin-update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminUpdateUser(int id, [FromBody] AdminUpdateUserDto dto)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "Utilisateur non trouvé ❌" });

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Matricule = dto.Matricule;
            user.Email = dto.Email;
            user.State = dto.State;
            user.UpdateDate = DateTime.UtcNow;

            await _userRepository.UpdateUserAsync(user);
            return NoContent();
        }

        // PUT: api/users/admin-toggle-state/{id}
        [HttpPut("admin-toggle-state/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminToggleUserState(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "Utilisateur introuvable ❌" });

            user.State = !user.State;
            user.UpdateDate = DateTime.UtcNow;
            await _userRepository.UpdateUserAsync(user);

            return Ok(new
            {
                message = user.State ? "Utilisateur activé ✅" : "Utilisateur désactivé ✅",
                currentState = user.State
            });
        }

        // POST: api/users/admin-assign-roles/{id}
        [HttpPost("admin-assign-roles/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminAssignUserRoles(int id, [FromBody] AssignRolesRequest request)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "Utilisateur introuvable ❌" });

            var currentRoles = await _userRoleRepository.GetRolesForUserAsync(id);
            foreach (var role in currentRoles)
                await _userRoleRepository.DeleteAsync(id, role.Id);

            foreach (var roleId in request.RoleIds)
            {
                var userRole = new UserRole
                {
                    UserId = id,
                    RoleId = roleId,
                    AssignedById = request.AssignedById,
                    AssignmentDate = DateTime.UtcNow,
                    IsActive = true,
                    Note = request.Note
                };

                await _userRoleRepository.AddAsync(userRole);
            }

            return Ok(new { message = "Rôles mis à jour avec succès ✅" });
        }

        // PUT: api/users/user-change-password
        [HttpPut("user-change-password")]
        public async Task<IActionResult> UserChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "Utilisateur introuvable ❌" });

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
                return BadRequest(new { message = "Mot de passe actuel incorrect ❌" });

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdateDate = DateTime.UtcNow;

            await _userRepository.UpdateUserAsync(user);
            return Ok(new { message = "Mot de passe mis à jour ✅" });
        }
    }
}
