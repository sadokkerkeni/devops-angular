using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IWarehouseRepository
    {
        // Legacy methods
        Task<IEnumerable<Warehouse>> GetAllAsync(bool? isActive = true);
        Task<Warehouse?> GetByIdAsync(int id);
        Task AddAsync(Warehouse warehouse);
        Task UpdateAsync(Warehouse warehouse);
        Task<bool> ExistsAsync(int id);

        // Company-aware methods
        Task<IEnumerable<Warehouse>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<Warehouse?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}
