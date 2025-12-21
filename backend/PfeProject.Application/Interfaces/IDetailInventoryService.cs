using PfeProject.Application.Models.DetailInventories;

namespace PfeProject.Application.Interfaces
{
    public interface IDetailInventoryService
    {
        // Legacy methods
        Task<IEnumerable<DetailInventoryReadDto>> GetAllAsync(bool? isActive = true);
        Task<DetailInventoryReadDto?> GetByIdAsync(int id);
        Task<IEnumerable<DetailInventoryReadDto>> GetByInventoryIdAsync(int inventoryId, bool? isActive = true);
        Task CreateAsync(DetailInventoryCreateDto dto);
        Task<bool> UpdateAsync(int id, DetailInventoryUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<DetailInventoryReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<DetailInventoryReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<IEnumerable<DetailInventoryReadDto>> GetByInventoryIdAndCompanyAsync(int inventoryId, int companyId, bool? isActive = true);
        Task CreateForCompanyAsync(DetailInventoryCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, DetailInventoryUpdateDto dto, int companyId);
    }
}
