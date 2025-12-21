using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class PicklistRepository : IPicklistRepository
    {
        private readonly ApplicationDbContext _context;

        public PicklistRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Picklist>> GetAllAsync(bool? isActive = true)
        {
            var query = _context.Picklists
                .Include(p => p.Status)
                .Include(p => p.Warehouse)
                .Include(p => p.Line)
                .AsQueryable();

            if (isActive.HasValue)
                query = query.Where(p => p.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<Picklist?> GetByIdAsync(int id)
        {
            return await _context.Picklists
                .Include(p => p.Status)
                .Include(p => p.Warehouse)
                .Include(p => p.Line)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Picklist picklist)
        {
            _context.Picklists.Add(picklist);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Picklist picklist)
        {
            _context.Picklists.Update(picklist);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Picklists.AnyAsync(p => p.Id == id);
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var picklist = await _context.Picklists.FindAsync(id);
            if (picklist == null) return false;

            picklist.IsActive = isActive;
            await _context.SaveChangesAsync();
            return true;
        }

        // Company-aware methods
        public async Task<IEnumerable<Picklist>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var query = _context.Picklists
                .Include(p => p.Status)
                .Include(p => p.Warehouse)
                .Include(p => p.Line)
                .Where(p => p.CompanyId == companyId);

            if (isActive.HasValue)
                query = query.Where(p => p.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<Picklist?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            return await _context.Picklists
                .Include(p => p.Status)
                .Include(p => p.Warehouse)
                .Include(p => p.Line)
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId);
        }
    }
}
