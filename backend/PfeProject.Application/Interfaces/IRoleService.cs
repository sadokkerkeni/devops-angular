using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface IRoleService
    {
        // Legacy methods
        Task<IEnumerable<Role>> GetAllAsync();
        Task<Role> GetByIdAsync(int id);
        Task<Role> GetByNameAsync(string name);
        Task AddAsync(Role role);
        Task UpdateAsync(Role role);
        Task DeleteAsync(int id);

        // Company-aware methods
        Task<IEnumerable<Role>> GetAllByCompanyAsync(int companyId);
        Task<Role> GetByIdAndCompanyAsync(int id, int companyId);
        Task<Role> GetByNameAndCompanyAsync(string name, int companyId);
        Task AddForCompanyAsync(Role role, int companyId);
    }
}