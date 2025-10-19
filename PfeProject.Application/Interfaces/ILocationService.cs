using PfeProject.Application.Models.Locations;

namespace PfeProject.Application.Interfaces
{
    public interface ILocationService
    {
        Task<IEnumerable<LocationReadDto>> GetAllAsync(bool? isActive = true);
        Task<LocationReadDto?> GetByIdAsync(int id);
        Task CreateAsync(LocationCreateDto dto);
        Task<bool> UpdateAsync(int id, LocationUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
    }
}
