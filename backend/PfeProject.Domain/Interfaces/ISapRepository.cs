using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface ISapRepository
    {
        // Legacy methods
        Task<IEnumerable<Sap>> GetAllAsync(bool? isActive = true);
        Task<Sap?> GetByIdAsync(int id);
        Task AddAsync(Sap sap);
        Task UpdateAsync(Sap sap);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task SetActiveStatusAsync(int id, bool isActive);
        Task<Sap?> GetByUsCodeAsync(string usCode);

        // Company-aware methods
        Task<IEnumerable<Sap>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<Sap?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<bool> ExistsByIdAndCompanyAsync(int id, int companyId);
    }
}
