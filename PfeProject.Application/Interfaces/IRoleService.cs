using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<Role>> GetAllAsync();
        Task<Role> GetByIdAsync(int id);
        Task<Role> GetByNameAsync(string name);
        Task AddAsync(Role role);
        Task UpdateAsync(Role role);
        Task DeleteAsync(int id);
    }
}