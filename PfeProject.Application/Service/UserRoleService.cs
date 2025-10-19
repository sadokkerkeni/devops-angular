using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Services
{
    public class UserRoleService
    {
        private readonly IUserRoleRepository _userRoleRepository;

        public UserRoleService(IUserRoleRepository userRoleRepository)
        {
            _userRoleRepository = userRoleRepository;
        }

        public async Task<IEnumerable<UserRole>> GetAllAsync() =>
            await _userRoleRepository.GetAllAsync();

        public async Task<UserRole> GetByIdAsync(int userId, int roleId) =>
            await _userRoleRepository.GetByIdAsync(userId, roleId);

        public async Task AddAsync(UserRole userRole) =>
            await _userRoleRepository.AddAsync(userRole);

        public async Task UpdateAsync(UserRole userRole) =>
            await _userRoleRepository.UpdateAsync(userRole);

        public async Task DeleteAsync(int userId, int roleId) =>
            await _userRoleRepository.DeleteAsync(userId, roleId);

        public async Task<IEnumerable<Role>> GetRolesForUserAsync(int userId) =>
            await _userRoleRepository.GetRolesForUserAsync(userId);

        public async Task<IEnumerable<User>> GetUsersForRoleAsync(int roleId) =>
            await _userRoleRepository.GetUsersForRoleAsync(roleId);
    }
}
