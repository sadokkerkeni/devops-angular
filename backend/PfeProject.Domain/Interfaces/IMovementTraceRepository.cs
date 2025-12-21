using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IMovementTraceRepository
    {
        // Legacy methods
        Task<IEnumerable<MovementTrace>> GetAllAsync(bool? isActive = true);
        Task<MovementTrace?> GetByIdAsync(int id);
        Task AddAsync(MovementTrace entity);
        Task<bool> ExistsAsync(int id);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);

        // Company-aware methods
        Task<IEnumerable<MovementTrace>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<MovementTrace?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}
