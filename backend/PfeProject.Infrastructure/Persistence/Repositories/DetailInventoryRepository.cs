using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class DetailInventoryRepository : IDetailInventoryRepository
    {
        private readonly ApplicationDbContext _context;

        public DetailInventoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DetailInventory>> GetAllAsync(bool? isActive = true)
        {
            var query = _context.DetailInventories.AsQueryable();

            if (isActive.HasValue)
                query = query.Where(d => d.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<DetailInventory>> GetByInventoryIdAsync(int inventoryId, bool? isActive = true)
        {
            var query = _context.DetailInventories
                                .Where(d => d.InventoryId == inventoryId);

            if (isActive.HasValue)
                query = query.Where(d => d.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<DetailInventory?> GetByIdAsync(int id)
        {
            return await _context.DetailInventories.FindAsync(id);
        }

        public async Task AddAsync(DetailInventory entity)
        {
            _context.DetailInventories.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(DetailInventory entity)
        {
            _context.DetailInventories.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.DetailInventories.AnyAsync(d => d.Id == id);
        }

        public async Task SetActiveStatusAsync(int id, bool isActive)
        {
            var entity = await _context.DetailInventories.FindAsync(id);
            if (entity != null)
            {
                entity.IsActive = isActive;
                await _context.SaveChangesAsync();
            }
        }

        // Company-aware methods
        public async Task<IEnumerable<DetailInventory>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var query = _context.DetailInventories.Where(d => d.CompanyId == companyId); // 🏢 Filter by CompanyId

            if (isActive.HasValue)
                query = query.Where(d => d.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<DetailInventory?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            return await _context.DetailInventories
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId); // 🏢 Filter by CompanyId
        }

        public async Task<IEnumerable<DetailInventory>> GetByInventoryIdAndCompanyAsync(int inventoryId, int companyId, bool? isActive = true)
        {
            var query = _context.DetailInventories
                .Where(d => d.InventoryId == inventoryId && d.CompanyId == companyId); // 🏢 Filter by CompanyId

            if (isActive.HasValue)
                query = query.Where(d => d.IsActive == isActive.Value);

            return await query.ToListAsync();
        }
    }
}
