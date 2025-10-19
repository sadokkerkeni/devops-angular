using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IMovementTraceRepository
    {
        Task<IEnumerable<MovementTrace>> GetAllAsync(bool? isActive = true);
        Task<MovementTrace?> GetByIdAsync(int id);
        Task AddAsync(MovementTrace entity);
        Task<bool> ExistsAsync(int id);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
    }
}
