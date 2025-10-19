using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IDetailInventoryRepository
    {
        Task<IEnumerable<DetailInventory>> GetAllAsync(bool? isActive = true);
        Task<DetailInventory?> GetByIdAsync(int id);
        Task<IEnumerable<DetailInventory>> GetByInventoryIdAsync(int inventoryId, bool? isActive = true);
        Task AddAsync(DetailInventory entity);
        Task UpdateAsync(DetailInventory entity);
        Task<bool> ExistsAsync(int id);
        Task SetActiveStatusAsync(int id, bool isActive);
    }
}
