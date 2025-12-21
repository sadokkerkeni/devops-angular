using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IStatusRepository
    {
        // Legacy methods
        Task<IEnumerable<Status>> GetAllAsync();
        Task<Status?> GetByIdAsync(int id);
        Task AddAsync(Status status);

        // Company-aware methods
        Task<IEnumerable<Status>> GetAllByCompanyAsync(int companyId);
        Task<Status?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}
