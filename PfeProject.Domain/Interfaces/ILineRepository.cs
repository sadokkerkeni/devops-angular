using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface ILineRepository
    {
        Task<IEnumerable<Line>> GetAllAsync(bool? isActive = true);
        Task<Line?> GetByIdAsync(int id);
        Task AddAsync(Line line);
        Task UpdateAsync(Line line);
        Task<bool> ExistsAsync(int id);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
    }
}
