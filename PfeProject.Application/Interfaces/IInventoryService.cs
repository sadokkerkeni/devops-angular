using PfeProject.Application.Models.Inventories;

namespace PfeProject.Application.Interfaces
{
    public interface IInventoryService
    {
        Task<IEnumerable<InventoryReadDto>> GetAllAsync(bool? isActive = true);
        Task<InventoryReadDto?> GetByIdAsync(int id);
        Task CreateAsync(InventoryCreateDto dto);
        Task<bool> UpdateAsync(int id, InventoryUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
    }
}
