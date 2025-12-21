using PfeProject.Application.Models.Lines;

namespace PfeProject.Application.Interfaces
{
    public interface ILineService
    {
        // Legacy methods
        Task<IEnumerable<LineReadDto>> GetAllAsync(bool? isActive = true);
        Task<LineReadDto?> GetByIdAsync(int id);
        Task<LineCreateDto> CreateAsync(LineCreateDto dto);
        Task<bool> UpdateAsync(int id, LineUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<LineReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<LineReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<LineCreateDto> CreateForCompanyAsync(LineCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, LineUpdateDto dto, int companyId);
    }
}
