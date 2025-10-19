using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IUserRoleRepository
    {
        Task<UserRole> GetByIdAsync(int userId, int roleId);
        Task<IReadOnlyList<UserRole>> GetAllAsync();
        Task AddAsync(UserRole userRole);
        Task UpdateAsync(UserRole userRole);
        Task DeleteAsync(int userId, int roleId);
        Task<bool> ExistsAsync(int userId, int roleId);
        Task<IReadOnlyList<Role>> GetRolesForUserAsync(int userId);
        Task<IReadOnlyList<User>> GetUsersForRoleAsync(int roleId);

    }
}
