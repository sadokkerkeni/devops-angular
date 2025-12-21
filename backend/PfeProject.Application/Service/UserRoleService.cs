using PfeProject.Application.Interfaces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Services
{
    public class UserRoleService : IUserRoleService
    {
        private readonly IUserRoleRepository _userRoleRepository;

        public UserRoleService(IUserRoleRepository userRoleRepository)
        {
            _userRoleRepository = userRoleRepository;
        }

        // Legacy methods
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

        public async Task<bool> ExistsAsync(int userId, int roleId) =>
            await _userRoleRepository.ExistsAsync(userId, roleId);

        // Company-aware methods
        public async Task<IEnumerable<UserRole>> GetAllByCompanyAsync(int companyId) =>
            await _userRoleRepository.GetAllByCompanyAsync(companyId);

        public async Task<UserRole> GetByIdAndCompanyAsync(int userId, int roleId, int companyId) =>
            await _userRoleRepository.GetByIdAndCompanyAsync(userId, roleId, companyId);

        public async Task<IEnumerable<Role>> GetRolesForUserAndCompanyAsync(int userId, int companyId) =>
            await _userRoleRepository.GetRolesForUserAndCompanyAsync(userId, companyId);

        public async Task<IEnumerable<User>> GetUsersForRoleAndCompanyAsync(int roleId, int companyId) =>
            await _userRoleRepository.GetUsersForRoleAndCompanyAsync(roleId, companyId);

        public async Task AddForCompanyAsync(UserRole userRole, int companyId)
        {
            userRole.CompanyId = companyId; // 🏢 Set Company relationship
            await _userRoleRepository.AddAsync(userRole);
        }

        public async Task<bool> ExistsInCompanyAsync(int userId, int roleId, int companyId) =>
            await _userRoleRepository.ExistsInCompanyAsync(userId, roleId, companyId);
    }
}
