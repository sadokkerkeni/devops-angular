using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IDetailPicklistRepository
    {
        Task<List<DetailPicklist>> GetAllAsync(bool? isActive = true);
        Task<List<DetailPicklist>> GetAllActiveAsync();
        Task<DetailPicklist?> GetByIdAsync(int id);
        Task<DetailPicklist> AddAsync(DetailPicklist entity);
        Task UpdateAsync(DetailPicklist entity);
        Task<bool> DeactivateAsync(int id);
        Task<bool> ActivateAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<IEnumerable<DetailPicklist>> GetByPicklistIdAsync(int picklistId);

    }
}
