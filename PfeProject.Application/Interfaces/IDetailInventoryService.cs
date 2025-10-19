using PfeProject.Application.Models.DetailInventories;

namespace PfeProject.Application.Interfaces
{
    public interface IDetailInventoryService
    {
        Task<IEnumerable<DetailInventoryReadDto>> GetAllAsync(bool? isActive = true);
        Task<DetailInventoryReadDto?> GetByIdAsync(int id);
        Task<IEnumerable<DetailInventoryReadDto>> GetByInventoryIdAsync(int inventoryId, bool? isActive = true);
        Task CreateAsync(DetailInventoryCreateDto dto);
        Task<bool> UpdateAsync(int id, DetailInventoryUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
    }
}
