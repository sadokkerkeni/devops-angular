using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IRoleRepository
    {
        Task<IReadOnlyList<Role>> GetAllRolesAsync();
        Task<Role> GetRoleByIdAsync(int id);
        Task<Role> GetByNameAsync(string roleName); // ✅ AJOUT
        Task AddRoleAsync(Role role);
        Task UpdateRoleAsync(Role role);
        Task DeleteRoleAsync(int id);
    }
}
