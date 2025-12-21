using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Users;
using PfeProject.Application.Models.users; // For UserCreateDto
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PfeProject.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<UserWithRolesDto>> GetAllByCompanyAsync(int companyId)
        {
            var users = await _userRepository.GetAllByCompanyAsync(companyId);
            return users.Select(u => new UserWithRolesDto
            {
                Id = u.Id,
                Matricule = u.Matricule,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Roles = u.UserRoles?.Where(ur => ur.IsActive)
                    .Select(ur => new UserWithRolesDto.RoleInfo
                    {
                        Id = ur.Role.Id,
                        Name = ur.Role.Name
                    }).ToList() ?? new List<UserWithRolesDto.RoleInfo>()
            });
        }

        public async Task<UserWithRolesDto?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            var user = await _userRepository.GetByIdAndCompanyAsync(id, companyId);
            if (user == null) return null;

            return new UserWithRolesDto
            {
                Id = user.Id,
                Matricule = user.Matricule,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Roles = user.UserRoles?.Where(ur => ur.IsActive)
                    .Select(ur => new UserWithRolesDto.RoleInfo
                    {
                        Id = ur.Role.Id,
                        Name = ur.Role.Name
                    }).ToList() ?? new List<UserWithRolesDto.RoleInfo>()
            };
        }

        public async Task<UserWithRolesDto> CreateForCompanyAsync(UserCreateDto dto, int companyId)
        {
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
                CompanyId = companyId  // 🏢 Set Company relationship
            };

            await _userRepository.AddUserAsync(user);

            return new UserWithRolesDto
            {
                Id = user.Id,
                Matricule = user.Matricule,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Roles = new List<UserWithRolesDto.RoleInfo>()
            };
        }

        public async Task<bool> UpdateForCompanyAsync(int id, int companyId, UpdateProfileDto dto)
        {
            var user = await _userRepository.GetByIdAndCompanyAsync(id, companyId);
            if (user == null) return false;

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Matricule = dto.Matricule;
            user.Email = dto.Email;
            user.UpdateDate = DateTime.UtcNow;

            await _userRepository.UpdateUserAsync(user);
            return true;
        }

        public async Task<bool> DeactivateForCompanyAsync(int id, int companyId)
        {
            var user = await _userRepository.GetByIdAndCompanyAsync(id, companyId);
            if (user == null) return false;

            user.State = false;
            user.UpdateDate = DateTime.UtcNow;

            await _userRepository.UpdateUserAsync(user);
            return true;
        }

        // Legacy methods for backward compatibility
        public async Task AddUserAsync(User user)
        {
            await _userRepository.AddUserAsync(user);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user != null)
            {
                user.State = false;
                await _userRepository.UpdateUserAsync(user);
            }
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return (await _userRepository.GetAllUsersAsync()).ToList();
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetUserByIdAsync(id);
        }

        public async Task UpdateUserAsync(User user)
        {
            await _userRepository.UpdateUserAsync(user);
        }
    }
}