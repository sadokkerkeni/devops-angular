using PfeProject.Application.Models.Picklists;

namespace PfeProject.Application.Interfaces
{
    public interface IPicklistService
    {
        // Legacy methods
        Task<IEnumerable<PicklistReadDto>> GetAllAsync(bool? isActive = true);
        Task<PicklistReadDto?> GetByIdAsync(int id);
        Task<PicklistReadDto> CreateAsync(PicklistCreateDto dto);
        Task<bool> UpdateAsync(int id, PicklistUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<bool> SetStatusAsync(int id, int statusId);

        // Company-aware methods
        Task<IEnumerable<PicklistReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<PicklistReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<PicklistReadDto> CreateForCompanyAsync(PicklistCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, PicklistUpdateDto dto, int companyId);
        
        // Stock management
        Task<bool> DeductStockOnCompletionAsync(int picklistId, int companyId, int userId);
    }
}
