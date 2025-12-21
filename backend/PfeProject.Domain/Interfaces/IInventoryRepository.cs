using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IInventoryRepository
    {
        // Legacy methods
        Task<IEnumerable<Inventory>> GetAllAsync(bool? isActive = true);
        Task<Inventory?> GetByIdAsync(int id);
        Task AddAsync(Inventory inventory);
        Task UpdateAsync(Inventory inventory);
        Task<bool> ExistsAsync(int id);
        Task SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<Inventory>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<Inventory?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}

