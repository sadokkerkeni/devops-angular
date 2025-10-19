using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface ILocationRepository
    {
        Task<IEnumerable<Location>> GetAllAsync(bool? isActive = true);
        Task<Location?> GetByIdAsync(int id);
        Task AddAsync(Location location);
        Task UpdateAsync(Location location);
        Task<bool> ExistsAsync(int id);
        Task SetActiveStatusAsync(int id, bool isActive);

    }
}
