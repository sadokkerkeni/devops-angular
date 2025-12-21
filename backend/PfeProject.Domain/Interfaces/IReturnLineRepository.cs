using System.Collections.Generic;
using System.Threading.Tasks;
using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IReturnLineRepository
    {
        // Legacy methods
        Task<List<ReturnLine>> GetAllAsync();
        Task<ReturnLine?> GetByIdAsync(int id);
        Task<ReturnLine> CreateAsync(ReturnLine returnLine);
        Task<bool> UpdateAsync(ReturnLine returnLine);
        Task<bool> DeleteAsync(int id); // à adapter si tu fais un soft delete

        // Company-aware methods
        Task<List<ReturnLine>> GetAllByCompanyAsync(int companyId);
        Task<ReturnLine?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}
