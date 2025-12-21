using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IPicklistUsRepository
    {
        // Legacy methods
        Task<IEnumerable<PicklistUs>> GetFilteredAsync(int? statusId, int? userId, int? detailPicklistId, bool? isActive, string? nom);
        Task<PicklistUs?> GetByIdAsync(int id);
        Task<PicklistUs> AddAsync(PicklistUs entity);
        Task UpdateAsync(PicklistUs entity);
        Task<bool> DeactivateAsync(int id);
        Task<bool> ActivateAsync(int id);

        // Company-aware methods
        Task<IEnumerable<PicklistUs>> GetFilteredByCompanyAsync(int? statusId, int? userId, int? detailPicklistId, bool? isActive, string? nom, int companyId);
        Task<PicklistUs?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}
