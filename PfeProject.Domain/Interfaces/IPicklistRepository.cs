using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IPicklistRepository
    {
        Task<IEnumerable<Picklist>> GetAllAsync(bool? isActive = true);

        Task<Picklist?> GetByIdAsync(int id);
        Task AddAsync(Picklist picklist);
        Task UpdateAsync(Picklist picklist);
        Task<bool> ExistsAsync(int id);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
    }
}
