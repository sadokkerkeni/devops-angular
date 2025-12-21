using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IDetailInventoryRepository
    {
        // Legacy methods
        Task<IEnumerable<DetailInventory>> GetAllAsync(bool? isActive = true);
        Task<DetailInventory?> GetByIdAsync(int id);
        Task<IEnumerable<DetailInventory>> GetByInventoryIdAsync(int inventoryId, bool? isActive = true);
        Task AddAsync(DetailInventory entity);
        Task UpdateAsync(DetailInventory entity);
        Task<bool> ExistsAsync(int id);
        Task SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<DetailInventory>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<DetailInventory?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<IEnumerable<DetailInventory>> GetByInventoryIdAndCompanyAsync(int inventoryId, int companyId, bool? isActive = true);
    }
}
