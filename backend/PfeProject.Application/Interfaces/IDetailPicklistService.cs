
using PfeProject.Application.Models.DetailPicklists;

namespace PfeProject.Application.Interfaces
{
    public interface IDetailPicklistService
    {
        // Legacy methods
        Task<IEnumerable<DetailPicklistReadDto>> GetAllAsync(bool? isActive = true);
        Task<DetailPicklistReadDto?> GetByIdAsync(int id);
        Task<DetailPicklistReadDto> CreateAsync(DetailPicklistCreateDto dto);
        Task<bool> UpdateAsync(int id, DetailPicklistUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<IEnumerable<DetailPicklistReadDto>> GetByPicklistIdAsync(int picklistId);

        // Company-aware methods
        Task<IEnumerable<DetailPicklistReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<DetailPicklistReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<DetailPicklistReadDto> CreateForCompanyAsync(DetailPicklistCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, DetailPicklistUpdateDto dto, int companyId);
        Task<bool> DeleteForCompanyAsync(int id, int companyId);
        Task<IEnumerable<DetailPicklistReadDto>> GetByPicklistIdAndCompanyAsync(int picklistId, int companyId);
    }
}
