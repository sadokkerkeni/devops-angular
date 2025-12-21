using PfeProject.Application.Models.Statuses;

namespace PfeProject.Application.Interfaces
{
    public interface IStatusService
    {
        // Legacy methods
        Task<IEnumerable<StatusReadDto>> GetAllAsync();
        Task<StatusReadDto?> GetByIdAsync(int id);
        Task<StatusReadDto> CreateAsync(StatusCreateDto dto);

        // Company-aware methods
        Task<IEnumerable<StatusReadDto>> GetAllByCompanyAsync(int companyId);
        Task<StatusReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<StatusReadDto> CreateForCompanyAsync(StatusCreateDto dto, int companyId);
    }
}
