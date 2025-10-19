using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly ApplicationDbContext _context;

        public InventoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Inventory>> GetAllAsync(bool? isActive = true)
        {
            var query = _context.Inventories.AsQueryable();
            if (isActive.HasValue)
                query = query.Where(i => i.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<Inventory?> GetByIdAsync(int id)
        {
            return await _context.Inventories
                .Include(i => i.DetailInventories)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task AddAsync(Inventory inventory)
        {
            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Inventory inventory)
        {
            _context.Inventories.Update(inventory);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Inventories.AnyAsync(i => i.Id == id);
        }

        public async Task SetActiveStatusAsync(int id, bool isActive)
        {
            var inv = await _context.Inventories.FindAsync(id);
            if (inv != null)
            {
                inv.IsActive = isActive;
                await _context.SaveChangesAsync();
            }
        }
    }
}
