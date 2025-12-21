using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IUserRoleRepository
    {
        // Legacy methods
        Task<UserRole?> GetByIdAsync(int userId, int roleId);
        Task<IReadOnlyList<UserRole>> GetAllAsync();
        Task AddAsync(UserRole userRole);
        Task UpdateAsync(UserRole userRole);
        Task DeleteAsync(int userId, int roleId);
        Task<bool> ExistsAsync(int userId, int roleId);
        Task<IReadOnlyList<Role>> GetRolesForUserAsync(int userId);
        Task<IReadOnlyList<User>> GetUsersForRoleAsync(int roleId);

        // Company-aware methods
        Task<IReadOnlyList<UserRole>> GetAllByCompanyAsync(int companyId);
        Task<UserRole?> GetByIdAndCompanyAsync(int userId, int roleId, int companyId);
        Task<IReadOnlyList<Role>> GetRolesForUserAndCompanyAsync(int userId, int companyId);
        Task<IReadOnlyList<User>> GetUsersForRoleAndCompanyAsync(int roleId, int companyId);
        Task<bool> ExistsInCompanyAsync(int userId, int roleId, int companyId);
    }
}
