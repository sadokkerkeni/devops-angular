using PfeProject.Application.Models.Lines;

namespace PfeProject.Application.Interfaces
{
    public interface ILineService
    {
        Task<IEnumerable<LineReadDto>> GetAllAsync(bool? isActive = true);
        Task<LineReadDto?> GetByIdAsync(int id);
        Task<LineCreateDto> CreateAsync(LineCreateDto dto);
        Task<bool> UpdateAsync(int id, LineUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
    }
}
