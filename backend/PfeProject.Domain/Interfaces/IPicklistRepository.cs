using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IPicklistRepository
    {
        // Legacy methods
        Task<IEnumerable<Picklist>> GetAllAsync(bool? isActive = true);
        Task<Picklist?> GetByIdAsync(int id);
        Task AddAsync(Picklist picklist);
        Task UpdateAsync(Picklist picklist);
        Task<bool> ExistsAsync(int id);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<Picklist>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<Picklist?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}
