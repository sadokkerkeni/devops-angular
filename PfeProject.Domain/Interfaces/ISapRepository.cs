using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface ISapRepository
    {
        Task<IEnumerable<Sap>> GetAllAsync(bool? isActive = true);
        Task<Sap?> GetByIdAsync(int id);
        Task AddAsync(Sap sap);
        Task UpdateAsync(Sap sap);
        Task<bool> ExistsAsync(int id);
        Task SetActiveStatusAsync(int id, bool isActive); // ✅
        Task<Sap?> GetByUsCodeAsync(string usCode);

    }
}
