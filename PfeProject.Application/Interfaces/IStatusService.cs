using PfeProject.Application.Models.Statuses;

namespace PfeProject.Application.Interfaces
{
    public interface IStatusService
    {
        Task<IEnumerable<StatusReadDto>> GetAllAsync();
        Task<StatusReadDto?> GetByIdAsync(int id);
        Task<StatusReadDto> CreateAsync(StatusCreateDto dto);
    }
}
