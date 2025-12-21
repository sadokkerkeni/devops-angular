using PfeProject.Application.Models.Inventories;

namespace PfeProject.Application.Interfaces
{
    public interface IInventoryService
    {
        // Legacy methods
        Task<IEnumerable<InventoryReadDto>> GetAllAsync(bool? isActive = true);
        Task<InventoryReadDto?> GetByIdAsync(int id);
        Task CreateAsync(InventoryCreateDto dto);
        Task<bool> UpdateAsync(int id, InventoryUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<InventoryReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<InventoryReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task CreateForCompanyAsync(InventoryCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, int companyId, InventoryUpdateDto dto);
    }
}
