using PfeProject.Application.Models.Warehouses;

namespace PfeProject.Application.Interfaces
{
    public interface IWarehouseService
    {
        // Legacy methods
        Task<IEnumerable<WarehouseReadDto>> GetAllAsync(bool? isActive = true);
        Task<WarehouseReadDto?> GetByIdAsync(int id);
        Task CreateAsync(WarehouseCreateDto dto);
        Task<bool> UpdateAsync(int id, WarehouseUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<WarehouseReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<WarehouseReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task CreateForCompanyAsync(WarehouseCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, WarehouseUpdateDto dto, int companyId);
    }
}
