using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class DetailPicklistRepository : IDetailPicklistRepository
    {
        private readonly ApplicationDbContext _context;

        public DetailPicklistRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<DetailPicklist>> GetAllAsync(bool? isActive = true)
        {
            var query = _context.DetailPicklists
                .Include(d => d.Article)
                .Include(d => d.Status)
                .AsQueryable();

            if (isActive.HasValue)
                query = query.Where(d => d.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<List<DetailPicklist>> GetAllActiveAsync()
        {
            return await _context.DetailPicklists
                .Include(d => d.Article)
                .Include(d => d.Status)
                .Where(d => d.IsActive)
                .ToListAsync();
        }

        public async Task<DetailPicklist?> GetByIdAsync(int id)
        {
            return await _context.DetailPicklists
                .Include(d => d.Article)
                .Include(d => d.Status)
                .Include(d => d.PicklistUs) // 🔄 Inclure PicklistUs pour l'automatisation MovementTrace
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<DetailPicklist> AddAsync(DetailPicklist entity)
        {
            _context.DetailPicklists.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(DetailPicklist entity)
        {
            _context.DetailPicklists.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeactivateAsync(int id)
        {
            var entity = await _context.DetailPicklists.FindAsync(id);
            if (entity == null || !entity.IsActive) return false;

            entity.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivateAsync(int id)
        {
            var entity = await _context.DetailPicklists.FindAsync(id);
            if (entity == null || entity.IsActive) return false;

            entity.IsActive = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.DetailPicklists.AnyAsync(d => d.Id == id);
        }
        public async Task<IEnumerable<DetailPicklist>> GetByPicklistIdAsync(int picklistId)
        {
            return await _context.DetailPicklists
                         .Include(dp => dp.Article)
                         .Include(dp => dp.Status)
                                 .Where(d => d.PicklistId == picklistId)
                                 .ToListAsync();
        }

        // Company-aware methods
        public async Task<List<DetailPicklist>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var query = _context.DetailPicklists
                .Include(d => d.Article)
                .Include(d => d.Status)
                .Where(d => d.CompanyId == companyId); // 🏢 Filter by CompanyId

            if (isActive.HasValue)
                query = query.Where(d => d.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<DetailPicklist?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            return await _context.DetailPicklists
                .Include(d => d.Article)
                .Include(d => d.Status)
                .Include(d => d.PicklistUs) // 🔄 Inclure PicklistUs pour l'automatisation MovementTrace
                .FirstOrDefaultAsync(d => d.Id == id && d.CompanyId == companyId); // 🏢 Filter by CompanyId
        }

        public async Task<bool> ExistsByIdAndCompanyAsync(int id, int companyId)
        {
            return await _context.DetailPicklists
                .AnyAsync(d => d.Id == id && d.CompanyId == companyId);
        }

        public async Task DeleteAsync(int id)
        {
            var detailPicklist = await _context.DetailPicklists.FindAsync(id);
            if (detailPicklist != null)
            {
                _context.DetailPicklists.Remove(detailPicklist);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<DetailPicklist>> GetByPicklistIdAndCompanyAsync(int picklistId, int companyId)
        {
            return await _context.DetailPicklists
                .Include(dp => dp.Article)
                .Include(dp => dp.Status)
                .Where(d => d.PicklistId == picklistId && d.CompanyId == companyId) // 🏢 Filter by CompanyId
                .ToListAsync();
        }
    }
}
