using PfeProject.Application.Models.Saps;

namespace PfeProject.Application.Interfaces
{
    public interface ISapService
    {
        // Legacy methods (for backward compatibility)
        Task<IEnumerable<SapReadDto>> GetAllAsync(bool? isActive = true);
        Task<SapReadDto?> GetByIdAsync(int id);
        Task CreateAsync(SapCreateDto dto);
        Task<bool> UpdateAsync(int id, SapUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<bool> AddStockAsync(string usCode, int quantityToAdd);

        // Company-aware methods
        Task<IEnumerable<SapReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<SapReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<SapReadDto> CreateForCompanyAsync(SapCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, SapUpdateDto dto, int companyId);
        Task<bool> SetActiveStatusForCompanyAsync(int id, bool isActive, int companyId);
        Task<bool> DeleteForCompanyAsync(int id, int companyId);
        Task<bool> AddStockForCompanyAsync(string usCode, int quantityToAdd, int companyId);
        
        // Stock deduction (for picklist completion)
        Task<bool> DeductStockByArticleCodeAsync(string articleCode, int quantityToDeduct, int companyId, int userId, int picklistId);
    }
}
