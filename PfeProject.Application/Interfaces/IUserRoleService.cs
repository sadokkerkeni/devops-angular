using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface IUserRoleService
    {
        Task<IEnumerable<UserRole>> GetAllAsync();
        Task<UserRole> GetByIdAsync(int userId, int roleId);
        Task<IEnumerable<Role>> GetRolesForUserAsync(int userId);
        Task<IEnumerable<User>> GetUsersForRoleAsync(int roleId);
        Task AddAsync(UserRole userRole);
        Task UpdateAsync(UserRole userRole);
        Task DeleteAsync(int userId, int roleId);
        Task<bool> ExistsAsync(int userId, int roleId);
    }
}
