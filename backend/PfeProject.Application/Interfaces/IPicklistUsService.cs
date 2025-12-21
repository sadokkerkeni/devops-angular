
using PfeProject.Application.Models.PicklistUSs;

namespace PfeProject.Application.Interfaces
{
    public interface IPicklistUsService
    {
        // Legacy methods
        Task<IEnumerable<PicklistUsReadDto>> GetFilteredAsync(PicklistUsFilterDto filter);
        Task<PicklistUsReadDto?> GetByIdAsync(int id);
        Task<PicklistUsReadDto> CreateAsync(PicklistUsCreateDto dto);
        Task<bool> UpdateAsync(int id, PicklistUsUpdateDto dto);
        Task<bool> DeactivateAsync(int id);
        Task<bool> ActivateAsync(int id);

        // Company-aware methods
        Task<IEnumerable<PicklistUsReadDto>> GetFilteredByCompanyAsync(PicklistUsFilterDto filter, int companyId);
        Task<PicklistUsReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<PicklistUsReadDto> CreateForCompanyAsync(PicklistUsCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, PicklistUsUpdateDto dto, int companyId);
    }
}
