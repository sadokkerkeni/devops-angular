
namespace PfeProject.Application.Interfaces
{
    public interface IDetailPicklistService
    {
        Task<IEnumerable<DetailPicklistReadDto>> GetAllAsync(bool? isActive = true);
        Task<DetailPicklistReadDto?> GetByIdAsync(int id);
        Task<DetailPicklistReadDto> CreateAsync(DetailPicklistCreateDto dto);
        Task<bool> UpdateAsync(int id, DetailPicklistUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<IEnumerable<DetailPicklistReadDto>> GetByPicklistIdAsync(int picklistId);

    }
}
