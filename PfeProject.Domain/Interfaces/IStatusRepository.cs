using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IStatusRepository
    {
        Task<IEnumerable<Status>> GetAllAsync();
        Task<Status?> GetByIdAsync(int id);
        Task AddAsync(Status status);
    }
}
