using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface ILineRepository
    {
        // Legacy methods
        Task<IEnumerable<Line>> GetAllAsync(bool? isActive = true);
        Task<Line?> GetByIdAsync(int id);
        Task AddAsync(Line line);
        Task UpdateAsync(Line line);
        Task<bool> ExistsAsync(int id);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<Line>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<Line?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}
