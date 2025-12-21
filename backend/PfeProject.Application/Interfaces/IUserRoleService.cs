using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface IUserRoleService
    {
        // Legacy methods
        Task<IEnumerable<UserRole>> GetAllAsync();
        Task<UserRole> GetByIdAsync(int userId, int roleId);
        Task<IEnumerable<Role>> GetRolesForUserAsync(int userId);
        Task<IEnumerable<User>> GetUsersForRoleAsync(int roleId);
        Task AddAsync(UserRole userRole);
        Task UpdateAsync(UserRole userRole);
        Task DeleteAsync(int userId, int roleId);
        Task<bool> ExistsAsync(int userId, int roleId);

        // Company-aware methods
        Task<IEnumerable<UserRole>> GetAllByCompanyAsync(int companyId);
        Task<UserRole> GetByIdAndCompanyAsync(int userId, int roleId, int companyId);
        Task<IEnumerable<Role>> GetRolesForUserAndCompanyAsync(int userId, int companyId);
        Task<IEnumerable<User>> GetUsersForRoleAndCompanyAsync(int roleId, int companyId);
        Task AddForCompanyAsync(UserRole userRole, int companyId);
        Task<bool> ExistsInCompanyAsync(int userId, int roleId, int companyId);
    }
}
